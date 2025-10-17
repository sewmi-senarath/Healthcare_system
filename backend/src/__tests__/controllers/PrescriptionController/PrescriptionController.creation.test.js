/**
 * PrescriptionController - Creation Tests
 * Tests prescription creation, validation, and medicine management
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

describe('PrescriptionController - Creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPrescription', () => {
    describe('Positive Cases', () => {
      test('should successfully create prescription with valid data', async () => {
        // Arrange
        const prescriptionData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          medicines: [
            {
              name: 'Paracetamol',
              dosage: '500mg',
              frequency: 'twice daily',
              duration: '7 days',
              instructions: 'Take with food'
            },
            {
              name: 'Ibuprofen',
              dosage: '200mg',
              frequency: 'three times daily',
              duration: '5 days',
              instructions: 'Take after meals'
            }
          ],
          notes: 'Patient has mild fever and headache'
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });
        const mockPrescription = mockData.generateMockPrescription(prescriptionData);

        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Prescription', 'create', mockPrescription);

        // Act
        const result = await PrescriptionController.createPrescription(prescriptionData);

        // Assert
        expect(mockModels.Patient.findOne).toHaveBeenCalledWith({ patientId: 'PAT001' });
        expect(mockModels.Doctor.findOne).toHaveBeenCalledWith({ empID: 'DOC001' });
        expect(mockModels.Prescription.create).toHaveBeenCalledWith(
          expect.objectContaining({
            patientId: 'PAT001',
            doctorId: 'DOC001',
            medicines: prescriptionData.medicines,
            notes: prescriptionData.notes,
            status: 'pending'
          })
        );
        expect(result.success).toBe(true);
        expect(result.message).toBe('Prescription created successfully');
        expect(result.prescription).toBeDefined();
        expect(result.prescription.prescriptionId).toBeDefined();
      });

      test('should create prescription with single medicine', async () => {
        // Arrange
        const prescriptionData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          medicines: [
            {
              name: 'Aspirin',
              dosage: '100mg',
              frequency: 'once daily',
              duration: '30 days',
              instructions: 'Take in the morning'
            }
          ]
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });
        const mockPrescription = mockData.generateMockPrescription(prescriptionData);

        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Prescription', 'create', mockPrescription);

        // Act
        const result = await PrescriptionController.createPrescription(prescriptionData);

        // Assert
        expect(result.success).toBe(true);
        expect(result.prescription.medicines).toHaveLength(1);
        expect(result.prescription.medicines[0].name).toBe('Aspirin');
      });

      test('should generate unique prescription ID', async () => {
        // Arrange
        const prescriptionData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          medicines: [
            {
              name: 'Paracetamol',
              dosage: '500mg',
              frequency: 'twice daily',
              duration: '7 days'
            }
          ]
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });
        const mockPrescription = mockData.generateMockPrescription(prescriptionData);

        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Prescription', 'create', mockPrescription);

        // Act
        const result = await PrescriptionController.createPrescription(prescriptionData);

        // Assert
        expect(result.success).toBe(true);
        expect(result.prescription.prescriptionId).toBeDefined();
        expect(result.prescription.prescriptionId).toMatch(/^PRES\d{7}[A-Z]{2}$/);
      });
    });

    describe('Negative Cases', () => {
      test('should fail when patient not found', async () => {
        // Arrange
        const prescriptionData = {
          patientId: 'NONEXISTENT',
          doctorId: 'DOC001',
          medicines: [
            {
              name: 'Paracetamol',
              dosage: '500mg',
              frequency: 'twice daily',
              duration: '7 days'
            }
          ]
        };

        setupMockResponse('Patient', 'findOne', null);

        // Act
        const result = await PrescriptionController.createPrescription(prescriptionData);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Patient not found');
      });

      test('should fail when doctor not found', async () => {
        // Arrange
        const prescriptionData = {
          patientId: 'PAT001',
          doctorId: 'NONEXISTENT',
          medicines: [
            {
              name: 'Paracetamol',
              dosage: '500mg',
              frequency: 'twice daily',
              duration: '7 days'
            }
          ]
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', null);

        // Act
        const result = await PrescriptionController.createPrescription(prescriptionData);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Doctor not found');
      });

      test('should fail with missing required fields', async () => {
        // Arrange
        const prescriptionData = {
          patientId: 'PAT001',
          // Missing doctorId and medicines
        };

        // Act
        const result = await PrescriptionController.createPrescription(prescriptionData);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Missing required prescription details');
      });

      test('should fail with empty medicines array', async () => {
        // Arrange
        const prescriptionData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          medicines: []
        };

        // Act
        const result = await PrescriptionController.createPrescription(prescriptionData);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('At least one medicine is required');
      });

      test('should fail with invalid medicine data', async () => {
        // Arrange
        const prescriptionData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          medicines: [
            {
              name: 'Paracetamol',
              // Missing required fields: dosage, frequency, duration
            }
          ]
        };

        // Act
        const result = await PrescriptionController.createPrescription(prescriptionData);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid medicine data');
      });
    });

    describe('Error Cases', () => {
      test('should handle database errors when creating prescription', async () => {
        // Arrange
        const prescriptionData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          medicines: [
            {
              name: 'Paracetamol',
              dosage: '500mg',
              frequency: 'twice daily',
              duration: '7 days'
            }
          ]
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });

        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', mockDoctor);
        
        const dbError = new Error('Database save failed');
        setupMockError('Prescription', 'create', dbError);

        // Act & Assert
        await expect(
          PrescriptionController.createPrescription(prescriptionData)
        ).rejects.toThrow('Database save failed');
      });

      test('should handle database errors when validating patient', async () => {
        // Arrange
        const prescriptionData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          medicines: [
            {
              name: 'Paracetamol',
              dosage: '500mg',
              frequency: 'twice daily',
              duration: '7 days'
            }
          ]
        };

        const dbError = new Error('Patient query failed');
        setupMockError('Patient', 'findOne', dbError);

        // Act & Assert
        await expect(
          PrescriptionController.createPrescription(prescriptionData)
        ).rejects.toThrow('Patient query failed');
      });
    });

    describe('Edge Cases', () => {
      test('should handle prescription with maximum number of medicines', async () => {
        // Arrange
        const medicines = Array.from({ length: 10 }, (_, i) => ({
          name: `Medicine ${i + 1}`,
          dosage: '100mg',
          frequency: 'once daily',
          duration: '7 days'
        }));

        const prescriptionData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          medicines
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });
        const mockPrescription = mockData.generateMockPrescription(prescriptionData);

        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Prescription', 'create', mockPrescription);

        // Act
        const result = await PrescriptionController.createPrescription(prescriptionData);

        // Assert
        expect(result.success).toBe(true);
        expect(result.prescription.medicines).toHaveLength(10);
      });

      test('should handle prescription with special characters in notes', async () => {
        // Arrange
        const prescriptionData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          medicines: [
            {
              name: 'Paracetamol',
              dosage: '500mg',
              frequency: 'twice daily',
              duration: '7 days'
            }
          ],
          notes: 'Patient has allergies to penicillin & sulfa drugs. Monitor closely!'
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });
        const mockPrescription = mockData.generateMockPrescription(prescriptionData);

        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Prescription', 'create', mockPrescription);

        // Act
        const result = await PrescriptionController.createPrescription(prescriptionData);

        // Assert
        expect(result.success).toBe(true);
        expect(result.prescription.notes).toBe('Patient has allergies to penicillin & sulfa drugs. Monitor closely!');
      });
    });
  });
});
