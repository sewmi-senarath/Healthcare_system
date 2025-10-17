/**
 * AppointmentBookingController - Booking Tests
 * Tests appointment creation, validation, and conflict detection
 */

import { jest } from '@jest/globals';
import AppointmentBookingController from '../../../controllers/AppointmentBookingController.js';
import { mockModels, mockData, setupMockResponse, setupMockError } from '../../mocks/models.js';

// Mock all dependencies
jest.unstable_mockModule('../../../models/Appointment.js', () => ({
  default: mockModels.Appointment
}));

jest.unstable_mockModule('../../../models/Doctor.js', () => ({
  default: mockModels.Doctor
}));

jest.unstable_mockModule('../../../models/Patient.js', () => ({
  default: mockModels.Patient
}));

describe('AppointmentBookingController - Booking Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('bookAppointment', () => {
    describe('Positive Cases', () => {
      test('should book appointment successfully with valid data', async () => {
        // Arrange
        const appointmentData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          date: '2024-01-15',
          time: '10:00',
          type: 'consultation',
          reason: 'Regular checkup',
          notes: 'Patient has concerns about headaches'
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });
        const mockAppointment = mockData.generateMockAppointment(appointmentData);

        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Appointment', 'find', []); // No conflicts
        setupMockResponse('Appointment', 'create', mockAppointment);

        // Act
        const result = await AppointmentBookingController.bookAppointment(appointmentData);

        // Assert
        expect(mockModels.Patient.findOne).toHaveBeenCalledWith({ patientId: 'PAT001' });
        expect(mockModels.Doctor.findOne).toHaveBeenCalledWith({ empID: 'DOC001' });
        expect(mockModels.Appointment.find).toHaveBeenCalledWith({
          doctorId: 'DOC001',
          date: '2024-01-15',
          time: '10:00',
          status: { $in: ['pending', 'approved', 'confirmed'] }
        });
        expect(mockModels.Appointment.create).toHaveBeenCalledWith(
          expect.objectContaining({
            patientId: 'PAT001',
            doctorId: 'DOC001',
            date: '2024-01-15',
            time: '10:00',
            type: 'consultation',
            reason: 'Regular checkup',
            status: 'pending'
          })
        );
        expect(result.success).toBe(true);
        expect(result.message).toBe('Appointment booked successfully');
        expect(result.appointment).toBeDefined();
      });

      test('should book appointment with minimal required data', async () => {
        // Arrange
        const appointmentData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          date: '2024-01-15',
          time: '10:00',
          type: 'consultation'
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });
        const mockAppointment = mockData.generateMockAppointment(appointmentData);

        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Appointment', 'find', []);
        setupMockResponse('Appointment', 'create', mockAppointment);

        // Act
        const result = await AppointmentBookingController.bookAppointment(appointmentData);

        // Assert
        expect(result.success).toBe(true);
        expect(result.appointment).toBeDefined();
      });

      test('should generate unique appointment ID', async () => {
        // Arrange
        const appointmentData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          date: '2024-01-15',
          time: '10:00',
          type: 'consultation'
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });
        const mockAppointment = mockData.generateMockAppointment(appointmentData);

        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Appointment', 'find', []);
        setupMockResponse('Appointment', 'create', mockAppointment);

        // Act
        const result = await AppointmentBookingController.bookAppointment(appointmentData);

        // Assert
        expect(result.success).toBe(true);
        expect(result.appointment.appointmentId).toBeDefined();
        expect(result.appointment.appointmentId).toMatch(/^APT\d{7}[A-Z]{2}$/);
      });
    });

    describe('Negative Cases', () => {
      test('should fail when patient not found', async () => {
        // Arrange
        const appointmentData = {
          patientId: 'NONEXISTENT',
          doctorId: 'DOC001',
          date: '2024-01-15',
          time: '10:00',
          type: 'consultation'
        };

        setupMockResponse('Patient', 'findOne', null);

        // Act
        const result = await AppointmentBookingController.bookAppointment(appointmentData);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Patient not found');
      });

      test('should fail when doctor not found', async () => {
        // Arrange
        const appointmentData = {
          patientId: 'PAT001',
          doctorId: 'NONEXISTENT',
          date: '2024-01-15',
          time: '10:00',
          type: 'consultation'
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', null);

        // Act
        const result = await AppointmentBookingController.bookAppointment(appointmentData);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Doctor not found');
      });

      test('should fail when appointment slot is already booked', async () => {
        // Arrange
        const appointmentData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          date: '2024-01-15',
          time: '10:00',
          type: 'consultation'
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });
        const existingAppointment = mockData.generateMockAppointment({
          doctorId: 'DOC001',
          date: '2024-01-15',
          time: '10:00',
          status: 'approved'
        });

        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Appointment', 'find', [existingAppointment]);

        // Act
        const result = await AppointmentBookingController.bookAppointment(appointmentData);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Appointment slot is already booked');
      });

      test('should fail with missing required fields', async () => {
        // Arrange
        const appointmentData = {
          patientId: 'PAT001',
          // Missing doctorId, date, time, type
        };

        // Act
        const result = await AppointmentBookingController.bookAppointment(appointmentData);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Missing required appointment details');
      });

      test('should fail with invalid appointment type', async () => {
        // Arrange
        const appointmentData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          date: '2024-01-15',
          time: '10:00',
          type: 'invalid_type'
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });

        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', mockDoctor);

        // Act
        const result = await AppointmentBookingController.bookAppointment(appointmentData);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid appointment type');
      });
    });

    describe('Error Cases', () => {
      test('should handle database errors when creating appointment', async () => {
        // Arrange
        const appointmentData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          date: '2024-01-15',
          time: '10:00',
          type: 'consultation'
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });

        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Appointment', 'find', []);
        
        const dbError = new Error('Database save failed');
        setupMockError('Appointment', 'create', dbError);

        // Act & Assert
        await expect(
          AppointmentBookingController.bookAppointment(appointmentData)
        ).rejects.toThrow('Database save failed');
      });

      test('should handle database errors when checking conflicts', async () => {
        // Arrange
        const appointmentData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          date: '2024-01-15',
          time: '10:00',
          type: 'consultation'
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });

        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', mockDoctor);
        
        const dbError = new Error('Appointment query failed');
        setupMockError('Appointment', 'find', dbError);

        // Act & Assert
        await expect(
          AppointmentBookingController.bookAppointment(appointmentData)
        ).rejects.toThrow('Appointment query failed');
      });
    });

    describe('Edge Cases', () => {
      test('should handle appointment booking at doctor availability boundaries', async () => {
        // Arrange
        const appointmentData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          date: '2024-01-15',
          time: '09:00', // First slot
          type: 'consultation'
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        const mockDoctor = mockData.generateMockDoctor({ 
          empID: 'DOC001',
          availability: {
            monday: { start: '09:00', end: '17:00', isAvailable: true }
          }
        });
        const mockAppointment = mockData.generateMockAppointment(appointmentData);

        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Appointment', 'find', []);
        setupMockResponse('Appointment', 'create', mockAppointment);

        // Act
        const result = await AppointmentBookingController.bookAppointment(appointmentData);

        // Assert
        expect(result.success).toBe(true);
      });

      test('should handle appointment booking with special characters in reason', async () => {
        // Arrange
        const appointmentData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          date: '2024-01-15',
          time: '10:00',
          type: 'consultation',
          reason: 'Patient has concerns about headaches & dizziness'
        };

        const mockPatient = mockData.generateMockPatient({ patientId: 'PAT001' });
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });
        const mockAppointment = mockData.generateMockAppointment(appointmentData);

        setupMockResponse('Patient', 'findOne', mockPatient);
        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Appointment', 'find', []);
        setupMockResponse('Appointment', 'create', mockAppointment);

        // Act
        const result = await AppointmentBookingController.bookAppointment(appointmentData);

        // Assert
        expect(result.success).toBe(true);
        expect(result.appointment.reason).toBe('Patient has concerns about headaches & dizziness');
      });
    });
  });
});
