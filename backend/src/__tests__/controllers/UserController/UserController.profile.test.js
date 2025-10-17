/**
 * UserController Profile Management Tests
 * Tests user profile operations and password management
 */

import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
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

describe('UserController - Profile Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetControllerMocks();
  });

  describe('changePassword', () => {
    describe('Positive Cases', () => {
      test('should change password with correct current password', async () => {
        // Arrange
        const mockUser = mockData.generateMockUser({ password: '$2a$10$hashedpassword' });
        setupMockResponse('User', 'findById', mockUser);
        
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
        mockUser.save.mockResolvedValue();

        // Act
        const result = await UserController.changePassword(
          mockUser._id, 
          'currentpassword', 
          'newpassword'
        );

        // Assert
        expect(mockModels.User.findById).toHaveBeenCalledWith(mockUser._id);
        expect(bcrypt.compare).toHaveBeenCalledWith('currentpassword', '$2a$10$hashedpassword');
        expect(mockUser.save).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.message).toBe('Password changed successfully');
      });
    });

    describe('Negative Cases', () => {
      test('should fail when user not found', async () => {
        // Arrange
        setupMockResponse('User', 'findById', null);

        // Act
        const result = await UserController.changePassword(
          'nonexistent-id', 
          'currentpassword', 
          'newpassword'
        );

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('User not found');
      });

      test('should fail with incorrect current password', async () => {
        // Arrange
        const mockUser = mockData.generateMockUser({ password: '$2a$10$hashedpassword' });
        setupMockResponse('User', 'findById', mockUser);
        
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

        // Act
        const result = await UserController.changePassword(
          mockUser._id, 
          'wrongpassword', 
          'newpassword'
        );

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Current password is incorrect');
      });
    });

    describe('Error Cases', () => {
      test('should handle database errors during password change', async () => {
        // Arrange
        const mockUser = mockData.generateMockUser({ password: '$2a$10$hashedpassword' });
        setupMockResponse('User', 'findById', mockUser);
        
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
        mockUser.save.mockRejectedValue(new Error('Database save failed'));

        // Act & Assert
        await expect(
          UserController.changePassword(mockUser._id, 'currentpassword', 'newpassword')
        ).rejects.toThrow('Database save failed');
      });
    });
  });

  describe('getUserProfile', () => {
    describe('Positive Cases', () => {
      test('should get user profile successfully', async () => {
        // Arrange
        const mockUser = mockData.generateMockUser();
        mockUser.select.mockReturnValue(mockUser);
        mockUser.toObject.mockReturnValue({ ...mockUser, password: undefined });
        setupMockResponse('User', 'findById', mockUser);

        // Act
        const result = await UserController.getUserProfile(mockUser._id);

        // Assert
        expect(mockModels.User.findById).toHaveBeenCalledWith(mockUser._id);
        expect(mockUser.select).toHaveBeenCalledWith('-password');
        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
        expect(result.user.password).toBeUndefined();
      });
    });

    describe('Negative Cases', () => {
      test('should return error when user not found', async () => {
        // Arrange
        setupMockResponse('User', 'findById', null);

        // Act
        const result = await UserController.getUserProfile('nonexistent-id');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('User not found');
      });
    });

    describe('Error Cases', () => {
      test('should handle database errors during profile retrieval', async () => {
        // Arrange
        const dbError = new Error('Database query failed');
        setupMockError('User', 'findById', dbError);

        // Act & Assert
        await expect(
          UserController.getUserProfile('507f1f77bcf86cd799439011')
        ).rejects.toThrow('Database query failed');
      });
    });
  });

  describe('updateUserProfile', () => {
    describe('Positive Cases', () => {
      test('should update user profile with allowed fields', async () => {
        // Arrange
        const mockUser = mockData.generateMockUser();
        setupMockResponse('User', 'findById', mockUser);
        mockUser.save.mockResolvedValue();
        mockUser.toObject.mockReturnValue({ ...mockUser, password: undefined });

        const updateData = {
          name: 'Updated Name',
          email: 'updated@example.com',
          contactInfo: { phone: '+9876543210' }
        };

        // Act
        const result = await UserController.updateUserProfile(mockUser._id, updateData);

        // Assert
        expect(mockModels.User.findById).toHaveBeenCalledWith(mockUser._id);
        expect(mockUser.save).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.message).toBe('Profile updated successfully');
        expect(result.user).toBeDefined();
        expect(result.user.password).toBeUndefined();
      });

      test('should ignore disallowed fields', async () => {
        // Arrange
        const mockUser = mockData.generateMockUser();
        setupMockResponse('User', 'findById', mockUser);
        mockUser.save.mockResolvedValue();
        mockUser.toObject.mockReturnValue({ ...mockUser, password: undefined });

        const updateData = {
          name: 'Updated Name',
          password: 'should-not-be-updated', // Disallowed field
          adminField: 'should-be-ignored' // Disallowed field
        };

        // Act
        const result = await UserController.updateUserProfile(mockUser._id, updateData);

        // Assert
        expect(result.success).toBe(true);
        // Verify that password was not updated
        expect(mockUser.password).not.toBe('should-not-be-updated');
      });
    });

    describe('Negative Cases', () => {
      test('should return error when user not found', async () => {
        // Arrange
        setupMockResponse('User', 'findById', null);

        // Act
        const result = await UserController.updateUserProfile('nonexistent-id', { name: 'New Name' });

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('User not found');
      });
    });

    describe('Error Cases', () => {
      test('should handle database errors during profile update', async () => {
        // Arrange
        const mockUser = mockData.generateMockUser();
        setupMockResponse('User', 'findById', mockUser);
        mockUser.save.mockRejectedValue(new Error('Database update failed'));

        // Act & Assert
        await expect(
          UserController.updateUserProfile(mockUser._id, { name: 'New Name' })
        ).rejects.toThrow('Database update failed');
      });
    });
  });
});
