/**
 * PatientController Registration Tests
 * Tests patient registration and login functionality
 */

import { jest } from '@jest/globals';
import PatientController from '../../../controllers/PatientController.js';
import { mockModels, mockData, setupMockResponse, setupMockError } from '../../mocks/models.js';
import { mockUserController, setupEmailExists, resetControllerMocks } from '../../mocks/controllers.js';

// Mock all dependencies
jest.unstable_mockModule('../../../models/Patient.js', () => ({
  default: mockModels.Patient
}));

jest.unstable_mockModule('../../../controllers/UserController.js', () => ({
  default: mockUserController
}));

describe('PatientController - Registration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetControllerMocks();
  });

  describe('registerPatient', () => {
    describe('Positive Cases', () => {
      test('should successfully register new patient', async () => {
        // Arrange
        const patientData = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          contactInfo: {
            phone: '+1234567890',
            address: '123 Main St'
          }
        };

        setupEmailExists(false); // Email doesn't exist
        mockModels.Patient.mockImplementation(() => {
          const mockPatient = mockData.generateMockPatient(patientData);
          mockPatient.save.mockResolvedValue();
          return mockPatient;
        });

        mockUserController.generateTokens.mockReturnValue({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        });

        // Act
        const result = await PatientController.registerPatient(patientData);

        // Assert
        expect(mockUserController.checkEmailExists).toHaveBeenCalledWith('john@example.com', 'patient');
        expect(mockModels.Patient).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            patientId: expect.stringMatching(/^PAT\d{7}[A-Z]{2}$/),
            dateOfBirth: new Date('1990-01-01'),
            gender: 'male',
            contactInfo: patientData.contactInfo
          })
        );
        expect(result.success).toBe(true);
        expect(result.message).toBe('Patient registered successfully');
        expect(result.userType).toBe('patient');
        expect(result.accessToken).toBe('mock-access-token');
        expect(result.refreshToken).toBe('mock-refresh-token');
        expect(result.user.password).toBeUndefined();
      });

      test('should register patient with minimal data', async () => {
        // Arrange
        const patientData = {
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          dateOfBirth: '1985-05-15',
          gender: 'female'
        };

        setupEmailExists(false);
        mockModels.Patient.mockImplementation(() => {
          const mockPatient = mockData.generateMockPatient(patientData);
          mockPatient.save.mockResolvedValue();
          return mockPatient;
        });

        mockUserController.generateTokens.mockReturnValue({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        });

        // Act
        const result = await PatientController.registerPatient(patientData);

        // Assert
        expect(result.success).toBe(true);
        expect(result.user.contactInfo).toEqual({});
      });
    });

    describe('Negative Cases', () => {
      test('should fail when email already exists', async () => {
        // Arrange
        const patientData = {
          name: 'John Doe',
          email: 'existing@example.com',
          password: 'password123',
          dateOfBirth: '1990-01-01',
          gender: 'male'
        };

        setupEmailExists(true); // Email already exists

        // Act
        const result = await PatientController.registerPatient(patientData);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Email already registered');
      });
    });

    describe('Error Cases', () => {
      test('should handle database save errors', async () => {
        // Arrange
        const patientData = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          dateOfBirth: '1990-01-01',
          gender: 'male'
        };

        setupEmailExists(false);
        mockModels.Patient.mockImplementation(() => {
          const mockPatient = mockData.generateMockPatient(patientData);
          mockPatient.save.mockRejectedValue(new Error('Database save failed'));
          return mockPatient;
        });

        // Act & Assert
        await expect(PatientController.registerPatient(patientData)).rejects.toThrow('Database save failed');
      });

      test('should handle token generation errors', async () => {
        // Arrange
        const patientData = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          dateOfBirth: '1990-01-01',
          gender: 'male'
        };

        setupEmailExists(false);
        mockModels.Patient.mockImplementation(() => {
          const mockPatient = mockData.generateMockPatient(patientData);
          mockPatient.save.mockResolvedValue();
          return mockPatient;
        });

        mockUserController.generateTokens.mockImplementation(() => {
          throw new Error('Token generation failed');
        });

        // Act & Assert
        await expect(PatientController.registerPatient(patientData)).rejects.toThrow('Token generation failed');
      });
    });

    describe('Edge Cases', () => {
      test('should handle missing contactInfo', async () => {
        // Arrange
        const patientData = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          dateOfBirth: '1990-01-01',
          gender: 'male'
          // contactInfo is undefined
        };

        setupEmailExists(false);
        mockModels.Patient.mockImplementation(() => {
          const mockPatient = mockData.generateMockPatient(patientData);
          mockPatient.save.mockResolvedValue();
          return mockPatient;
        });

        mockUserController.generateTokens.mockReturnValue({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        });

        // Act
        const result = await PatientController.registerPatient(patientData);

        // Assert
        expect(result.success).toBe(true);
      });
    });
  });

  describe('loginPatient', () => {
    describe('Positive Cases', () => {
      test('should successfully login patient', async () => {
        // Arrange
        mockUserController.authenticateUser.mockResolvedValue({
          success: true,
          message: 'patient logged in successfully',
          user: mockData.generateMockPatient(),
          userType: 'patient',
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        });

        // Act
        const result = await PatientController.loginPatient('patient@example.com', 'password123');

        // Assert
        expect(mockUserController.authenticateUser).toHaveBeenCalledWith(
          'patient@example.com',
          'password123',
          'patient'
        );
        expect(result.success).toBe(true);
        expect(result.userType).toBe('patient');
      });
    });

    describe('Negative Cases', () => {
      test('should fail login with invalid credentials', async () => {
        // Arrange
        mockUserController.authenticateUser.mockResolvedValue({
          success: false,
          message: 'Invalid email or password'
        });

        // Act
        const result = await PatientController.loginPatient('invalid@example.com', 'wrongpassword');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid email or password');
      });
    });
  });
});
