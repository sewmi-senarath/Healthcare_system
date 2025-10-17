/**
 * AppointmentController Core Operations Tests
 * Tests department, doctor retrieval, and basic appointment operations
 */

import { jest } from '@jest/globals';
import AppointmentController from '../../../controllers/AppointmentController.js';
import { resetControllerMocks } from '../../mocks/controllers.js';

// Mock all dependencies
jest.unstable_mockModule('../../../controllers/AppointmentCoreController.js', () => ({
  default: {
    getDepartments: jest.fn(),
    getDoctorsByDepartment: jest.fn(),
    getDoctorById: jest.fn(),
    getPatientAppointments: jest.fn(),
    getDoctorAppointments: jest.fn(),
    getAllAppointmentsForManager: jest.fn(),
    updateAppointmentStatus: jest.fn(),
    cancelAppointment: jest.fn()
  }
}));

describe('AppointmentController - Core Operations', () => {
  let mockAppointmentCoreController;

  beforeEach(async () => {
    jest.clearAllMocks();
    resetControllerMocks();
    
    // Import mocked controllers
    const coreModule = await import('../../../controllers/AppointmentCoreController.js');
    mockAppointmentCoreController = coreModule.default;
  });

  describe('getDepartments', () => {
    describe('Positive Cases', () => {
      test('should return all available departments', async () => {
        // Arrange
        const expectedDepartments = [
          { id: 'cardiology', name: 'Cardiology', description: 'Heart and cardiovascular care' },
          { id: 'neurology', name: 'Neurology', description: 'Brain and nervous system care' }
        ];
        
        mockAppointmentCoreController.getDepartments.mockResolvedValue({
          success: true,
          departments: expectedDepartments
        });

        // Act
        const result = await AppointmentController.getDepartments();

        // Assert
        expect(mockAppointmentCoreController.getDepartments).toHaveBeenCalled();
        expect(result.success).toBe(true);
        expect(result.departments).toEqual(expectedDepartments);
      });
    });

    describe('Negative Cases', () => {
      test('should handle empty departments list', async () => {
        // Arrange
        mockAppointmentCoreController.getDepartments.mockResolvedValue({
          success: true,
          departments: []
        });

        // Act
        const result = await AppointmentController.getDepartments();

        // Assert
        expect(result.success).toBe(true);
        expect(result.departments).toEqual([]);
      });
    });

    describe('Error Cases', () => {
      test('should handle department retrieval errors', async () => {
        // Arrange
        mockAppointmentCoreController.getDepartments.mockResolvedValue({
          success: false,
          message: 'Failed to retrieve departments'
        });

        // Act
        const result = await AppointmentController.getDepartments();

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to retrieve departments');
      });
    });
  });

  describe('getDoctorsByDepartment', () => {
    describe('Positive Cases', () => {
      test('should return doctors for valid department', async () => {
        // Arrange
        const mockDoctors = [
          {
            empID: 'DOC001',
            name: 'Dr. John Smith',
            specialization: 'Cardiology',
            department: 'Cardiology',
            consultationFee: 150
          }
        ];
        
        mockAppointmentCoreController.getDoctorsByDepartment.mockResolvedValue({
          success: true,
          doctors: mockDoctors
        });

        // Act
        const result = await AppointmentController.getDoctorsByDepartment('cardiology');

        // Assert
        expect(mockAppointmentCoreController.getDoctorsByDepartment).toHaveBeenCalledWith('cardiology');
        expect(result.success).toBe(true);
        expect(result.doctors).toEqual(mockDoctors);
      });
    });

    describe('Negative Cases', () => {
      test('should return empty list for department with no doctors', async () => {
        // Arrange
        mockAppointmentCoreController.getDoctorsByDepartment.mockResolvedValue({
          success: true,
          doctors: [],
          message: 'No doctors found for this department'
        });

        // Act
        const result = await AppointmentController.getDoctorsByDepartment('nonexistent');

        // Assert
        expect(result.success).toBe(true);
        expect(result.doctors).toEqual([]);
        expect(result.message).toBe('No doctors found for this department');
      });
    });

    describe('Error Cases', () => {
      test('should handle doctor retrieval errors', async () => {
        // Arrange
        mockAppointmentCoreController.getDoctorsByDepartment.mockResolvedValue({
          success: false,
          message: 'Failed to retrieve doctors'
        });

        // Act
        const result = await AppointmentController.getDoctorsByDepartment('cardiology');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to retrieve doctors');
      });
    });
  });

  describe('getDoctorById', () => {
    describe('Positive Cases', () => {
      test('should return doctor details with availability', async () => {
        // Arrange
        const mockDoctor = {
          empID: 'DOC001',
          name: 'Dr. Jane Doe',
          specialization: 'Neurology',
          availability: {
            monday: { start: '09:00', end: '17:00', isAvailable: true }
          }
        };
        
        mockAppointmentCoreController.getDoctorById.mockResolvedValue({
          success: true,
          doctor: mockDoctor
        });

        // Act
        const result = await AppointmentController.getDoctorById('DOC001');

        // Assert
        expect(mockAppointmentCoreController.getDoctorById).toHaveBeenCalledWith('DOC001');
        expect(result.success).toBe(true);
        expect(result.doctor).toEqual(mockDoctor);
      });
    });

    describe('Negative Cases', () => {
      test('should return error for non-existent doctor', async () => {
        // Arrange
        mockAppointmentCoreController.getDoctorById.mockResolvedValue({
          success: false,
          message: 'Doctor not found'
        });

        // Act
        const result = await AppointmentController.getDoctorById('NONEXISTENT');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Doctor not found');
      });
    });
  });

  describe('Legacy Mock Methods', () => {
    describe('getMockDoctorsByDepartment', () => {
      describe('Positive Cases', () => {
        test('should return mock doctors for valid department', () => {
          // Act
          const result = AppointmentController.getMockDoctorsByDepartment('cardiology');

          // Assert
          expect(result.success).toBe(true);
          expect(result.doctors).toBeDefined();
          expect(result.doctors.length).toBeGreaterThan(0);
          expect(result.doctors[0].department).toBe('Cardiology');
        });

        test('should return mock doctors for neurology department', () => {
          // Act
          const result = AppointmentController.getMockDoctorsByDepartment('neurology');

          // Assert
          expect(result.success).toBe(true);
          expect(result.doctors).toBeDefined();
          expect(result.doctors.length).toBeGreaterThan(0);
          expect(result.doctors[0].department).toBe('Neurology');
        });
      });

      describe('Negative Cases', () => {
        test('should return empty array for unknown department', () => {
          // Act
          const result = AppointmentController.getMockDoctorsByDepartment('unknown');

          // Assert
          expect(result.success).toBe(true);
          expect(result.doctors).toEqual([]);
        });
      });
    });

    describe('getMockDoctorById', () => {
      describe('Positive Cases', () => {
        test('should return mock doctor for valid ID', () => {
          // Act
          const result = AppointmentController.getMockDoctorById('DOC2024001');

          // Assert
          expect(result.success).toBe(true);
          expect(result.doctor).toBeDefined();
          expect(result.doctor.empID).toBe('DOC2024001');
          expect(result.doctor.availability).toBeDefined();
        });
      });

      describe('Negative Cases', () => {
        test('should return error for unknown doctor ID', () => {
          // Act
          const result = AppointmentController.getMockDoctorById('UNKNOWN');

          // Assert
          expect(result.success).toBe(false);
          expect(result.message).toBe('Doctor not found');
        });
      });
    });
  });
});
