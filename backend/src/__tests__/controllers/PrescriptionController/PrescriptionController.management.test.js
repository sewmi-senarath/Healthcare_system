/**
 * PrescriptionController - Management Tests
 * Tests prescription retrieval, status updates, and search functionality
 */

import { jest } from '@jest/globals';
import PrescriptionController from '../../../controllers/PrescriptionController.js';
import { mockModels, mockData, setupMockResponse, setupMockError } from '../../mocks/models.js';

// Mock all dependencies
jest.unstable_mockModule('../../../models/Prescription.js', () => ({
  default: mockModels.Prescription
}));

jest.unstable_mockModule('../../../models/Patient.js', () => ({
  default: mockModels.Patient
}));

jest.unstable_mockModule('../../../models/Doctor.js', () => ({
  default: mockModels.Doctor
}));

describe('PrescriptionController - Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDoctorPrescriptions', () => {
    describe('Positive Cases', () => {
      test('should return prescriptions for valid doctor', async () => {
        // Arrange
        const mockPrescriptions = [
          mockData.generateMockPrescription({
            doctorId: 'DOC001',
            status: 'pending',
            patientId: 'PAT001'
          }),
          mockData.generateMockPrescription({
            doctorId: 'DOC001',
            status: 'sent_to_pharmacy',
            patientId: 'PAT002'
          })
        ];

        setupMockResponse('Prescription', 'find', mockPrescriptions);

        // Act
        const result = await PrescriptionController.getDoctorPrescriptions('DOC001');

        // Assert
        expect(mockModels.Prescription.find).toHaveBeenCalledWith({ doctorId: 'DOC001' });
        expect(result.success).toBe(true);
        expect(result.prescriptions).toEqual(mockPrescriptions);
      });

      test('should return prescriptions with specific status', async () => {
        // Arrange
        const mockPrescriptions = [
          mockData.generateMockPrescription({
            doctorId: 'DOC001',
            status: 'pending',
            patientId: 'PAT001'
          })
        ];

        setupMockResponse('Prescription', 'find', mockPrescriptions);

        // Act
        const result = await PrescriptionController.getDoctorPrescriptions('DOC001', 'pending');

        // Assert
        expect(mockModels.Prescription.find).toHaveBeenCalledWith({ 
          doctorId: 'DOC001',
          status: 'pending'
        });
        expect(result.success).toBe(true);
        expect(result.prescriptions).toEqual(mockPrescriptions);
      });
    });

    describe('Negative Cases', () => {
      test('should return empty array when no prescriptions found', async () => {
        // Arrange
        setupMockResponse('Prescription', 'find', []);

        // Act
        const result = await PrescriptionController.getDoctorPrescriptions('DOC001');

        // Assert
        expect(result.success).toBe(true);
        expect(result.prescriptions).toEqual([]);
      });
    });

    describe('Error Cases', () => {
      test('should handle database errors when fetching prescriptions', async () => {
        // Arrange
        const dbError = new Error('Database query failed');
        setupMockError('Prescription', 'find', dbError);

        // Act & Assert
        await expect(
          PrescriptionController.getDoctorPrescriptions('DOC001')
        ).rejects.toThrow('Database query failed');
      });
    });
  });

  describe('getPharmacistPrescriptions', () => {
    describe('Positive Cases', () => {
      test('should return prescriptions sent to pharmacy', async () => {
        // Arrange
        const mockPrescriptions = [
          mockData.generateMockPrescription({
            status: 'sent_to_pharmacy',
            patientId: 'PAT001'
          }),
          mockData.generateMockPrescription({
            status: 'sent_to_pharmacy',
            patientId: 'PAT002'
          })
        ];

        setupMockResponse('Prescription', 'find', mockPrescriptions);

        // Act
        const result = await PrescriptionController.getPharmacistPrescriptions();

        // Assert
        expect(mockModels.Prescription.find).toHaveBeenCalledWith({ 
          status: 'sent_to_pharmacy' 
        });
        expect(result.success).toBe(true);
        expect(result.prescriptions).toEqual(mockPrescriptions);
      });
    });

    describe('Negative Cases', () => {
      test('should return empty array when no prescriptions sent to pharmacy', async () => {
        // Arrange
        setupMockResponse('Prescription', 'find', []);

        // Act
        const result = await PrescriptionController.getPharmacistPrescriptions();

        // Assert
        expect(result.success).toBe(true);
        expect(result.prescriptions).toEqual([]);
      });
    });
  });

  describe('getPrescriptionById', () => {
    describe('Positive Cases', () => {
      test('should return prescription by valid ID', async () => {
        // Arrange
        const mockPrescription = mockData.generateMockPrescription({
          prescriptionId: 'PRES001'
        });

        setupMockResponse('Prescription', 'findOne', mockPrescription);

        // Act
        const result = await PrescriptionController.getPrescriptionById('PRES001');

        // Assert
        expect(mockModels.Prescription.findOne).toHaveBeenCalledWith({ 
          prescriptionId: 'PRES001' 
        });
        expect(result.success).toBe(true);
        expect(result.prescription).toEqual(mockPrescription);
      });
    });

    describe('Negative Cases', () => {
      test('should return error when prescription not found', async () => {
        // Arrange
        setupMockResponse('Prescription', 'findOne', null);

        // Act
        const result = await PrescriptionController.getPrescriptionById('NONEXISTENT');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Prescription not found');
      });
    });

    describe('Error Cases', () => {
      test('should handle database errors when fetching prescription', async () => {
        // Arrange
        const dbError = new Error('Database query failed');
        setupMockError('Prescription', 'findOne', dbError);

        // Act & Assert
        await expect(
          PrescriptionController.getPrescriptionById('PRES001')
        ).rejects.toThrow('Database query failed');
      });
    });
  });

  describe('updatePrescriptionStatus', () => {
    describe('Positive Cases', () => {
      test('should update prescription status successfully', async () => {
        // Arrange
        const mockPrescription = mockData.generateMockPrescription({
          prescriptionId: 'PRES001',
          status: 'pending'
        });

        mockPrescription.save.mockResolvedValue();
        setupMockResponse('Prescription', 'findOne', mockPrescription);

        // Act
        const result = await PrescriptionController.updatePrescriptionStatus('PRES001', 'sent_to_pharmacy');

        // Assert
        expect(mockModels.Prescription.findOne).toHaveBeenCalledWith({ 
          prescriptionId: 'PRES001' 
        });
        expect(mockPrescription.status).toBe('sent_to_pharmacy');
        expect(mockPrescription.save).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.message).toBe('Prescription status updated successfully');
      });

      test('should update status to dispensed', async () => {
        // Arrange
        const mockPrescription = mockData.generateMockPrescription({
          prescriptionId: 'PRES001',
          status: 'sent_to_pharmacy'
        });

        mockPrescription.save.mockResolvedValue();
        setupMockResponse('Prescription', 'findOne', mockPrescription);

        // Act
        const result = await PrescriptionController.updatePrescriptionStatus('PRES001', 'dispensed');

        // Assert
        expect(mockPrescription.status).toBe('dispensed');
        expect(result.success).toBe(true);
      });

      test('should update status to completed', async () => {
        // Arrange
        const mockPrescription = mockData.generateMockPrescription({
          prescriptionId: 'PRES001',
          status: 'dispensed'
        });

        mockPrescription.save.mockResolvedValue();
        setupMockResponse('Prescription', 'findOne', mockPrescription);

        // Act
        const result = await PrescriptionController.updatePrescriptionStatus('PRES001', 'completed');

        // Assert
        expect(mockPrescription.status).toBe('completed');
        expect(result.success).toBe(true);
      });
    });

    describe('Negative Cases', () => {
      test('should fail when prescription not found', async () => {
        // Arrange
        setupMockResponse('Prescription', 'findOne', null);

        // Act
        const result = await PrescriptionController.updatePrescriptionStatus('NONEXISTENT', 'sent_to_pharmacy');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Prescription not found');
      });

      test('should fail with invalid status', async () => {
        // Arrange
        const mockPrescription = mockData.generateMockPrescription({
          prescriptionId: 'PRES001',
          status: 'pending'
        });

        setupMockResponse('Prescription', 'findOne', mockPrescription);

        // Act
        const result = await PrescriptionController.updatePrescriptionStatus('PRES001', 'invalid_status');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid prescription status');
      });
    });

    describe('Error Cases', () => {
      test('should handle database errors during status update', async () => {
        // Arrange
        const mockPrescription = mockData.generateMockPrescription({
          prescriptionId: 'PRES001',
          status: 'pending'
        });

        setupMockResponse('Prescription', 'findOne', mockPrescription);
        mockPrescription.save.mockRejectedValue(new Error('Database save failed'));

        // Act & Assert
        await expect(
          PrescriptionController.updatePrescriptionStatus('PRES001', 'sent_to_pharmacy')
        ).rejects.toThrow('Database save failed');
      });
    });
  });

  describe('getPrescriptionStats', () => {
    describe('Positive Cases', () => {
      test('should return prescription statistics', async () => {
        // Arrange
        const mockStats = [
          {
            totalPrescriptions: 100,
            pendingPrescriptions: 20,
            sentToPharmacy: 30,
            dispensedPrescriptions: 40,
            completedPrescriptions: 10,
            cancelledPrescriptions: 0,
            expiredPrescriptions: 0,
            averageMedicinesPerPrescription: 2.5
          }
        ];

        mockModels.Prescription.getPrescriptionStatistics.mockResolvedValue(mockStats);

        // Act
        const result = await PrescriptionController.getPrescriptionStats();

        // Assert
        expect(mockModels.Prescription.getPrescriptionStatistics).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.statistics).toEqual(mockStats);
      });
    });

    describe('Error Cases', () => {
      test('should handle database errors when fetching statistics', async () => {
        // Arrange
        mockModels.Prescription.getPrescriptionStatistics.mockRejectedValue(
          new Error('Statistics query failed')
        );

        // Act & Assert
        await expect(
          PrescriptionController.getPrescriptionStats()
        ).rejects.toThrow('Statistics query failed');
      });
    });
  });

  describe('searchPrescriptionsByPatient', () => {
    describe('Positive Cases', () => {
      test('should search prescriptions by patient ID', async () => {
        // Arrange
        const mockPrescriptions = [
          mockData.generateMockPrescription({
            patientId: 'PAT001',
            status: 'completed'
          }),
          mockData.generateMockPrescription({
            patientId: 'PAT001',
            status: 'pending'
          })
        ];

        setupMockResponse('Prescription', 'find', mockPrescriptions);

        // Act
        const result = await PrescriptionController.searchPrescriptionsByPatient('PAT001');

        // Assert
        expect(mockModels.Prescription.find).toHaveBeenCalledWith({ 
          patientId: 'PAT001' 
        });
        expect(result.success).toBe(true);
        expect(result.prescriptions).toEqual(mockPrescriptions);
      });

      test('should search prescriptions by patient ID and status', async () => {
        // Arrange
        const mockPrescriptions = [
          mockData.generateMockPrescription({
            patientId: 'PAT001',
            status: 'completed'
          })
        ];

        setupMockResponse('Prescription', 'find', mockPrescriptions);

        // Act
        const result = await PrescriptionController.searchPrescriptionsByPatient('PAT001', 'completed');

        // Assert
        expect(mockModels.Prescription.find).toHaveBeenCalledWith({ 
          patientId: 'PAT001',
          status: 'completed'
        });
        expect(result.success).toBe(true);
        expect(result.prescriptions).toEqual(mockPrescriptions);
      });
    });

    describe('Negative Cases', () => {
      test('should return empty array when no prescriptions found for patient', async () => {
        // Arrange
        setupMockResponse('Prescription', 'find', []);

        // Act
        const result = await PrescriptionController.searchPrescriptionsByPatient('PAT001');

        // Assert
        expect(result.success).toBe(true);
        expect(result.prescriptions).toEqual([]);
      });
    });

    describe('Error Cases', () => {
      test('should handle database errors when searching prescriptions', async () => {
        // Arrange
        const dbError = new Error('Search query failed');
        setupMockError('Prescription', 'find', dbError);

        // Act & Assert
        await expect(
          PrescriptionController.searchPrescriptionsByPatient('PAT001')
        ).rejects.toThrow('Search query failed');
      });
    });
  });
});
