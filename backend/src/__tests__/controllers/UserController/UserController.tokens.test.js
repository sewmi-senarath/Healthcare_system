/**
 * UserController Token Management Tests
 * Tests JWT token generation, verification, and refresh
 */

import { jest } from '@jest/globals';
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

describe('UserController - Token Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetControllerMocks();
  });

  describe('generateTokens', () => {
    describe('Positive Cases', () => {
      test('should generate tokens for user', () => {
        // Arrange
        const mockUser = mockData.generateMockUser();
        const { generateTokenPair } = require('../../../middleware/auth.js');

        // Act
        const result = UserController.generateTokens(mockUser, 'patient');

        // Assert
        expect(generateTokenPair).toHaveBeenCalledWith(mockUser, 'patient');
        expect(result).toEqual({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        });
      });
    });
  });

  describe('verifyToken', () => {
    describe('Positive Cases', () => {
      test('should verify valid token', async () => {
        // Arrange
        const mockUser = mockData.generateMockUser();
        const mockDecoded = { userId: mockUser._id };
        
        jest.spyOn(jwt, 'verify').mockReturnValue(mockDecoded);
        setupMockResponse('User', 'findById', mockUser);

        // Act
        const result = await UserController.verifyToken('valid-token');

        // Assert
        expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
        expect(mockModels.User.findById).toHaveBeenCalledWith(mockUser._id);
        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
      });
    });

    describe('Negative Cases', () => {
      test('should fail verification for invalid token', async () => {
        // Arrange
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
          throw new Error('Invalid token');
        });

        // Act
        const result = await UserController.verifyToken('invalid-token');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid token');
      });

      test('should fail verification when user not found', async () => {
        // Arrange
        const mockDecoded = { userId: '507f1f77bcf86cd799439011' };
        
        jest.spyOn(jwt, 'verify').mockReturnValue(mockDecoded);
        setupMockResponse('User', 'findById', null);

        // Act & Assert
        await expect(UserController.verifyToken('valid-token')).rejects.toThrow('User not found');
      });
    });

    describe('Error Cases', () => {
      test('should handle JWT verification errors', async () => {
        // Arrange
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
          throw new Error('Token expired');
        });

        // Act
        const result = await UserController.verifyToken('expired-token');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid token');
      });
    });
  });

  describe('refreshToken', () => {
    describe('Positive Cases', () => {
      test('should refresh valid token', async () => {
        // Arrange
        const mockUser = mockData.generateMockUser();
        const mockDecoded = { userId: mockUser._id };
        
        jest.spyOn(jwt, 'verify').mockReturnValue(mockDecoded);
        setupMockResponse('User', 'findById', mockUser);

        // Act
        const result = await UserController.refreshToken('valid-refresh-token');

        // Assert
        expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', process.env.JWT_REFRESH_SECRET);
        expect(mockModels.User.findById).toHaveBeenCalledWith(mockUser._id);
        expect(result.success).toBe(true);
        expect(result.message).toBe('Token refreshed successfully');
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
      });
    });

    describe('Negative Cases', () => {
      test('should fail refresh for invalid token', async () => {
        // Arrange
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
          throw new Error('Invalid refresh token');
        });

        // Act
        const result = await UserController.refreshToken('invalid-refresh-token');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid refresh token');
      });
    });
  });
});
