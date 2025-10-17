/**
 * PatientController Profile Management Tests
 * Tests patient profile operations and medical records
 */

import { jest } from '@jest/globals';
import PatientController from '../../../controllers/PatientController.js';
import { mockModels, mockData, setupMockResponse, setupMockError } from '../../mocks/models.js';
import { resetControllerMocks } from '../../mocks/controllers.js';

// Mock all dependencies
jest.unstable_mockModule('../../../models/Patient.js', () => ({
  default: mockModels.Patient
}));

describe('PatientController - Profile Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetControllerMocks();
  });

  describe('getPatientProfile', () => {
    describe('Positive Cases', () => {
      test('should get patient profile successfully', async () => {
        // Arrange
        const mockPatient = mockData.generateMockPatient();
        mockPatient.select.mockReturnValue(mockPatient);
        setupMockResponse('Patient', 'findById', mockPatient);

        // Act
        const result = await PatientController.getPatientProfile(mockPatient._id);

        // Assert
        expect(mockModels.Patient.findById).toHaveBeenCalledWith(mockPatient._id);
        expect(mockPatient.select).toHaveBeenCalledWith('-password');
        expect(result.success).toBe(true);
        expect(result.patient).toBeDefined();
      });
    });

    describe('Negative Cases', () => {
      test('should return error when patient not found', async () => {
        // Arrange
        setupMockResponse('Patient', 'findById', null);

        // Act
        const result = await PatientController.getPatientProfile('nonexistent-id');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Patient not found');
      });
    });

    describe('Error Cases', () => {
      test('should handle database errors during profile retrieval', async () => {
        // Arrange
        const dbError = new Error('Database query failed');
        setupMockError('Patient', 'findById', dbError);

        // Act & Assert
        await expect(
          PatientController.getPatientProfile('507f1f77bcf86cd799439011')
        ).rejects.toThrow('Database query failed');
      });
    });
  });

  describe('updatePatientProfile', () => {
    describe('Positive Cases', () => {
      test('should update patient profile with allowed fields', async () => {
        // Arrange
        const mockPatient = mockData.generateMockPatient();
        setupMockResponse('Patient', 'findById', mockPatient);
        mockPatient.save.mockResolvedValue();
        mockPatient.toObject.mockReturnValue({ ...mockPatient, password: undefined });

        const updateData = {
          name: 'Updated Name',
          email: 'updated@example.com',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          contactInfo: { phone: '+9876543210' },
          address: { street: '456 New St', city: 'New City' },
          medicalHistory: ['diabetes'],
          allergies: ['peanuts'],
          insuranceDetails: { provider: 'ABC Insurance' }
        };

        // Act
        const result = await PatientController.updatePatientProfile(mockPatient._id, updateData);

        // Assert
        expect(mockModels.Patient.findById).toHaveBeenCalledWith(mockPatient._id);
        expect(mockPatient.save).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.message).toBe('Patient profile updated successfully');
        expect(result.patient).toBeDefined();
        expect(result.patient.password).toBeUndefined();
      });

      test('should update only provided fields', async () => {
        // Arrange
        const mockPatient = mockData.generateMockPatient();
        setupMockResponse('Patient', 'findById', mockPatient);
        mockPatient.save.mockResolvedValue();
        mockPatient.toObject.mockReturnValue({ ...mockPatient, password: undefined });

        const updateData = {
          name: 'Updated Name Only'
        };

        // Act
        const result = await PatientController.updatePatientProfile(mockPatient._id, updateData);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    describe('Negative Cases', () => {
      test('should return error when patient not found', async () => {
        // Arrange
        setupMockResponse('Patient', 'findById', null);

        // Act
        const result = await PatientController.updatePatientProfile('nonexistent-id', { name: 'New Name' });

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Patient not found');
      });
    });

    describe('Error Cases', () => {
      test('should handle database errors during profile update', async () => {
        // Arrange
        const mockPatient = mockData.generateMockPatient();
        setupMockResponse('Patient', 'findById', mockPatient);
        mockPatient.save.mockRejectedValue(new Error('Database update failed'));

        // Act & Assert
        await expect(
          PatientController.updatePatientProfile(mockPatient._id, { name: 'New Name' })
        ).rejects.toThrow('Database update failed');
      });
    });
  });

  describe('viewMedicalRecords', () => {
    describe('Positive Cases', () => {
      test('should return patient medical records', async () => {
        // Arrange
        const mockPatient = mockData.generateMockPatient({
          medicalHistory: ['diabetes', 'hypertension'],
          allergies: ['peanuts', 'shellfish'],
          insuranceDetails: { provider: 'ABC Insurance', policyNumber: 'POL123' }
        });
        setupMockResponse('Patient', 'findById', mockPatient);

        // Act
        const result = await PatientController.viewMedicalRecords(mockPatient._id);

        // Assert
        expect(result.success).toBe(true);
        expect(result.medicalRecords).toEqual({
          medicalHistory: ['diabetes', 'hypertension'],
          allergies: ['peanuts', 'shellfish'],
          insuranceDetails: { provider: 'ABC Insurance', policyNumber: 'POL123' }
        });
      });
    });

    describe('Negative Cases', () => {
      test('should return error when patient not found', async () => {
        // Arrange
        setupMockResponse('Patient', 'findById', null);

        // Act
        const result = await PatientController.viewMedicalRecords('nonexistent-id');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Patient not found');
      });
    });
  });

  describe('updateMedicalHistory', () => {
    describe('Positive Cases', () => {
      test('should update medical history successfully', async () => {
        // Arrange
        const mockPatient = mockData.generateMockPatient();
        setupMockResponse('Patient', 'findById', mockPatient);
        mockPatient.save.mockResolvedValue();

        const medicalHistory = ['diabetes', 'hypertension', 'asthma'];

        // Act
        const result = await PatientController.updateMedicalHistory(mockPatient._id, medicalHistory);

        // Assert
        expect(mockPatient.medicalHistory).toEqual(medicalHistory);
        expect(mockPatient.save).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.message).toBe('Medical history updated successfully');
        expect(result.medicalHistory).toEqual(medicalHistory);
      });
    });

    describe('Negative Cases', () => {
      test('should return error when patient not found', async () => {
        // Arrange
        setupMockResponse('Patient', 'findById', null);

        // Act
        const result = await PatientController.updateMedicalHistory('nonexistent-id', []);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Patient not found');
      });
    });
  });

  describe('updateAllergies', () => {
    describe('Positive Cases', () => {
      test('should update allergies successfully', async () => {
        // Arrange
        const mockPatient = mockData.generateMockPatient();
        setupMockResponse('Patient', 'findById', mockPatient);
        mockPatient.save.mockResolvedValue();

        const allergies = ['peanuts', 'shellfish', 'dairy'];

        // Act
        const result = await PatientController.updateAllergies(mockPatient._id, allergies);

        // Assert
        expect(mockPatient.allergies).toEqual(allergies);
        expect(mockPatient.save).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.message).toBe('Allergies updated successfully');
        expect(result.allergies).toEqual(allergies);
      });
    });

    describe('Negative Cases', () => {
      test('should return error when patient not found', async () => {
        // Arrange
        setupMockResponse('Patient', 'findById', null);

        // Act
        const result = await PatientController.updateAllergies('nonexistent-id', []);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Patient not found');
      });
    });
  });

  describe('getPatientById', () => {
    describe('Positive Cases', () => {
      test('should get patient by patient ID', async () => {
        // Arrange
        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        setupMockResponse('Patient', 'findOne', mockPatient);

        // Act
        const result = await PatientController.getPatientById('PAT001');

        // Assert
        expect(mockModels.Patient.findOne).toHaveBeenCalledWith({ patientId: 'PAT001' });
        expect(result.success).toBe(true);
        expect(result.patient).toBeDefined();
      });
    });

    describe('Negative Cases', () => {
      test('should return error when patient not found', async () => {
        // Arrange
        setupMockResponse('Patient', 'findOne', null);

        // Act
        const result = await PatientController.getPatientById('NONEXISTENT');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Patient not found');
      });
    });
  });
});
