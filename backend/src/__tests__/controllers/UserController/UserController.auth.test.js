/**
 * UserController Authentication Tests
 * Tests user authentication, login, and token management
 */

import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserController from '../../../controllers/UserController.js';
import { mockModels, mockData, setupMockResponse, setupMockError } from '../../mocks/models.js';
import { resetControllerMocks } from '../../mocks/controllers.js';

// Mock all dependencies
jest.unstable_mockModule('../../../models/User.js', () => ({
  default: mockModels.User
}));

jest.unstable_mockModule('../../../models/Patient.js', () => ({
  default: mockModels.Patient
}));

jest.unstable_mockModule('../../../middleware/auth.js', () => ({
  generateTokenPair: jest.fn().mockReturnValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token'
  })
}));

describe('UserController - Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetControllerMocks();
  });

  describe('findUserByEmailAndType', () => {
    describe('Positive Cases', () => {
      test('should find patient user by email and type', async () => {
        // Arrange
        const mockPatient = mockData.generateMockPatient();
        setupMockResponse('Patient', 'findOne', mockPatient);

        // Act
        const result = await UserController.findUserByEmailAndType('patient@example.com', 'patient');

        // Assert
        expect(mockModels.Patient.findOne).toHaveBeenCalledWith({ email: 'patient@example.com' });
        expect(result).toEqual(mockPatient);
      });

      test('should find employee user by email and type', async () => {
        // Arrange
        const mockUser = mockData.generateMockUser({ userType: 'doctor' });
        setupMockResponse('User', 'findOne', mockUser);

        // Act
        const result = await UserController.findUserByEmailAndType('doctor@example.com', 'doctor');

        // Assert
        expect(mockModels.User.findOne).toHaveBeenCalledWith({ 
          email: 'doctor@example.com', 
          userType: 'doctor' 
        });
        expect(result).toEqual(mockUser);
      });
    });

    describe('Negative Cases', () => {
      test('should return null when user not found', async () => {
        // Arrange
        setupMockResponse('Patient', 'findOne', null);

        // Act
        const result = await UserController.findUserByEmailAndType('nonexistent@example.com', 'patient');

        // Assert
        expect(result).toBeNull();
      });
    });

    describe('Error Cases', () => {
      test('should throw error when database operation fails', async () => {
        // Arrange
        const dbError = new Error('Database connection failed');
        setupMockError('Patient', 'findOne', dbError);

        // Act & Assert
        await expect(
          UserController.findUserByEmailAndType('patient@example.com', 'patient')
        ).rejects.toThrow('Database connection failed');
      });
    });
  });

  describe('checkEmailExists', () => {
    describe('Positive Cases', () => {
      test('should return user when email exists', async () => {
        // Arrange
        const mockUser = mockData.generateMockUser();
        setupMockResponse('User', 'findOne', mockUser);

        // Act
        const result = await UserController.checkEmailExists('test@example.com', 'patient');

        // Assert
        expect(mockModels.User.findOne).toHaveBeenCalledWith({ 
          email: 'test@example.com', 
          userType: 'patient' 
        });
        expect(result).toEqual(mockUser);
      });
    });

    describe('Negative Cases', () => {
      test('should return null when email does not exist', async () => {
        // Arrange
        setupMockResponse('User', 'findOne', null);

        // Act
        const result = await UserController.checkEmailExists('nonexistent@example.com', 'patient');

        // Assert
        expect(result).toBeNull();
      });
    });

    describe('Error Cases', () => {
      test('should throw error when database operation fails', async () => {
        // Arrange
        const dbError = new Error('Database query failed');
        setupMockError('User', 'findOne', dbError);

        // Act & Assert
        await expect(
          UserController.checkEmailExists('test@example.com', 'patient')
        ).rejects.toThrow('Database query failed');
      });
    });
  });

  describe('authenticateUser', () => {
    describe('Positive Cases', () => {
      test('should authenticate user with correct credentials', async () => {
        // Arrange
        const mockUser = mockData.generateMockUser({ password: '$2a$10$hashedpassword' });
        setupMockResponse('User', 'findOne', mockUser);
        
        // Mock bcrypt.compare to return true for correct password
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

        // Act
        const result = await UserController.authenticateUser('test@example.com', 'correctpassword', 'patient');

        // Assert
        expect(mockModels.User.findOne).toHaveBeenCalledWith({ 
          email: 'test@example.com', 
          userType: 'patient' 
        });
        expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', '$2a$10$hashedpassword');
        expect(result.success).toBe(true);
        expect(result.message).toBe('patient logged in successfully');
        expect(result.user).toBeDefined();
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
      });

      test('should authenticate patient user correctly', async () => {
        // Arrange
        const mockPatient = mockData.generateMockPatient({ password: '$2a$10$hashedpassword' });
        setupMockResponse('Patient', 'findOne', mockPatient);
        
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

        // Act
        const result = await UserController.authenticateUser('patient@example.com', 'correctpassword', 'patient');

        // Assert
        expect(mockModels.Patient.findOne).toHaveBeenCalledWith({ email: 'patient@example.com' });
        expect(result.success).toBe(true);
        expect(result.userType).toBe('patient');
      });
    });

    describe('Negative Cases', () => {
      test('should fail authentication when user not found', async () => {
        // Arrange
        setupMockResponse('User', 'findOne', null);

        // Act
        const result = await UserController.authenticateUser('nonexistent@example.com', 'password', 'patient');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid email or password');
      });

      test('should fail authentication with incorrect password', async () => {
        // Arrange
        const mockUser = mockData.generateMockUser({ password: '$2a$10$hashedpassword' });
        setupMockResponse('User', 'findOne', mockUser);
        
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

        // Act
        const result = await UserController.authenticateUser('test@example.com', 'wrongpassword', 'patient');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid email or password');
      });

      test('should handle bcrypt comparison errors gracefully', async () => {
        // Arrange
        const mockUser = mockData.generateMockUser({ password: '$2a$10$hashedpassword' });
        setupMockResponse('User', 'findOne', mockUser);
        
        jest.spyOn(bcrypt, 'compare').mockRejectedValue(new Error('Bcrypt error'));

        // Act & Assert
        await expect(
          UserController.authenticateUser('test@example.com', 'password', 'patient')
        ).rejects.toThrow('Bcrypt error');
      });
    });

    describe('Error Cases', () => {
      test('should handle database errors during authentication', async () => {
        // Arrange
        const dbError = new Error('Database connection lost');
        setupMockError('User', 'findOne', dbError);

        // Act & Assert
        await expect(
          UserController.authenticateUser('test@example.com', 'password', 'patient')
        ).rejects.toThrow('Database connection lost');
      });

      test('should handle token generation errors', async () => {
        // Arrange
        const mockUser = mockData.generateMockUser({ password: '$2a$10$hashedpassword' });
        setupMockResponse('User', 'findOne', mockUser);
        
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
        
        // Mock token generation to throw error
        const { generateTokenPair } = await import('../../../middleware/auth.js');
        generateTokenPair.mockImplementation(() => {
          throw new Error('Token generation failed');
        });

        // Act & Assert
        await expect(
          UserController.authenticateUser('test@example.com', 'correctpassword', 'patient')
        ).rejects.toThrow('Token generation failed');
      });
    });
  });
});
