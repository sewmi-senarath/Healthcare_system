/**
 * AppointmentBookingController - Slot Management Tests
 * Tests available slot generation and slot reservation logic
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

describe('AppointmentBookingController - Slot Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableSlots', () => {
    describe('Positive Cases', () => {
      test('should return available time slots for doctor and date', async () => {
        // Arrange
        const mockDoctor = mockData.generateMockDoctor({
          empID: 'DOC001',
          availability: {
            monday: { start: '09:00', end: '17:00', isAvailable: true },
            tuesday: { start: '09:00', end: '17:00', isAvailable: true },
            wednesday: { start: '09:00', end: '17:00', isAvailable: true },
            thursday: { start: '09:00', end: '17:00', isAvailable: true },
            friday: { start: '09:00', end: '17:00', isAvailable: true },
            saturday: { start: '09:00', end: '13:00', isAvailable: true },
            sunday: { start: '00:00', end: '00:00', isAvailable: false }
          }
        });

        setupMockResponse('Doctor', 'findOne', mockDoctor);
        
        // Mock no existing appointments
        setupMockResponse('Appointment', 'find', []);

        // Act
        const result = await AppointmentBookingController.getAvailableSlots('DOC001', '2024-01-15');

        // Assert
        expect(mockModels.Doctor.findOne).toHaveBeenCalledWith({ empID: 'DOC001' });
        expect(mockModels.Appointment.find).toHaveBeenCalledWith({
          doctorId: 'DOC001',
          date: '2024-01-15',
          status: { $in: ['pending', 'approved', 'confirmed'] }
        });
        expect(result.success).toBe(true);
        expect(result.slots).toBeDefined();
        expect(Array.isArray(result.slots)).toBe(true);
      });

      test('should return slots with correct time format', async () => {
        // Arrange
        const mockDoctor = mockData.generateMockDoctor({
          empID: 'DOC001',
          availability: {
            monday: { start: '09:00', end: '12:00', isAvailable: true }
          }
        });

        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Appointment', 'find', []);

        // Act
        const result = await AppointmentBookingController.getAvailableSlots('DOC001', '2024-01-15');

        // Assert
        expect(result.success).toBe(true);
        expect(result.slots).toBeDefined();
        
        // Check that slots have correct format
        result.slots.forEach(slot => {
          expect(slot).toHaveProperty('time');
          expect(slot).toHaveProperty('available');
          expect(typeof slot.available).toBe('boolean');
          expect(slot.time).toMatch(/^\d{2}:\d{2}$/); // HH:MM format
        });
      });

      test('should filter out booked slots', async () => {
        // Arrange
        const mockDoctor = mockData.generateMockDoctor({
          empID: 'DOC001',
          availability: {
            monday: { start: '09:00', end: '12:00', isAvailable: true }
          }
        });

        const existingAppointments = [
          { time: '09:00', status: 'approved' },
          { time: '10:00', status: 'pending' }
        ];

        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Appointment', 'find', existingAppointments);

        // Act
        const result = await AppointmentBookingController.getAvailableSlots('DOC001', '2024-01-15');

        // Assert
        expect(result.success).toBe(true);
        
        // Check that booked slots are marked as unavailable
        const bookedSlots = result.slots.filter(slot => !slot.available);
        expect(bookedSlots.length).toBeGreaterThan(0);
        
        const bookedTimes = bookedSlots.map(slot => slot.time);
        expect(bookedTimes).toContain('09:00');
        expect(bookedTimes).toContain('10:00');
      });
    });

    describe('Negative Cases', () => {
      test('should return error when doctor not found', async () => {
        // Arrange
        setupMockResponse('Doctor', 'findOne', null);

        // Act
        const result = await AppointmentBookingController.getAvailableSlots('NONEXISTENT', '2024-01-15');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Doctor not found');
      });

      test('should return error when doctor is not available on requested day', async () => {
        // Arrange
        const mockDoctor = mockData.generateMockDoctor({
          empID: 'DOC001',
          availability: {
            monday: { start: '00:00', end: '00:00', isAvailable: false }
          }
        });

        setupMockResponse('Doctor', 'findOne', mockDoctor);

        // Act
        const result = await AppointmentBookingController.getAvailableSlots('DOC001', '2024-01-15');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Doctor is not available on the requested day');
      });

      test('should return empty slots for past date', async () => {
        // Arrange
        const mockDoctor = mockData.generateMockDoctor({
          empID: 'DOC001',
          availability: {
            monday: { start: '09:00', end: '17:00', isAvailable: true }
          }
        });

        setupMockResponse('Doctor', 'findOne', mockDoctor);

        // Act
        const result = await AppointmentBookingController.getAvailableSlots('DOC001', '2020-01-15');

        // Assert
        expect(result.success).toBe(true);
        expect(result.slots).toEqual([]);
      });
    });

    describe('Error Cases', () => {
      test('should handle database errors when fetching doctor', async () => {
        // Arrange
        const dbError = new Error('Database connection failed');
        setupMockError('Doctor', 'findOne', dbError);

        // Act & Assert
        await expect(
          AppointmentBookingController.getAvailableSlots('DOC001', '2024-01-15')
        ).rejects.toThrow('Database connection failed');
      });

      test('should handle database errors when fetching appointments', async () => {
        // Arrange
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });
        setupMockResponse('Doctor', 'findOne', mockDoctor);
        
        const dbError = new Error('Appointment query failed');
        setupMockError('Appointment', 'find', dbError);

        // Act & Assert
        await expect(
          AppointmentBookingController.getAvailableSlots('DOC001', '2024-01-15')
        ).rejects.toThrow('Appointment query failed');
      });
    });

    describe('Edge Cases', () => {
      test('should handle doctor with no availability settings', async () => {
        // Arrange
        const mockDoctor = mockData.generateMockDoctor({
          empID: 'DOC001',
          availability: {}
        });

        setupMockResponse('Doctor', 'findOne', mockDoctor);

        // Act
        const result = await AppointmentBookingController.getAvailableSlots('DOC001', '2024-01-15');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Doctor is not available on the requested day');
      });

      test('should handle invalid date format gracefully', async () => {
        // Arrange
        const mockDoctor = mockData.generateMockDoctor({ empID: 'DOC001' });
        setupMockResponse('Doctor', 'findOne', mockDoctor);

        // Act
        const result = await AppointmentBookingController.getAvailableSlots('DOC001', 'invalid-date');

        // Assert
        expect(result.success).toBe(true);
        expect(result.slots).toEqual([]);
      });
    });
  });

  describe('reserveSlot', () => {
    describe('Positive Cases', () => {
      test('should reserve slot successfully', async () => {
        // Arrange
        const mockDoctor = mockData.generateMockDoctor({
          empID: 'DOC001',
          availability: {
            monday: { start: '09:00', end: '17:00', isAvailable: true }
          }
        });

        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Appointment', 'find', []); // No existing appointments

        // Act
        const result = await AppointmentBookingController.reserveSlot('DOC001', '2024-01-15', '10:00');

        // Assert
        expect(result.success).toBe(true);
        expect(result.message).toBe('Slot reserved successfully');
        expect(result.slot).toBeDefined();
        expect(result.slot.time).toBe('10:00');
        expect(result.slot.available).toBe(false);
      });
    });

    describe('Negative Cases', () => {
      test('should fail to reserve already booked slot', async () => {
        // Arrange
        const mockDoctor = mockData.generateMockDoctor({
          empID: 'DOC001',
          availability: {
            monday: { start: '09:00', end: '17:00', isAvailable: true }
          }
        });

        const existingAppointment = { time: '10:00', status: 'approved' };

        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Appointment', 'find', [existingAppointment]);

        // Act
        const result = await AppointmentBookingController.reserveSlot('DOC001', '2024-01-15', '10:00');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Slot is already booked');
      });

      test('should fail to reserve slot outside doctor availability', async () => {
        // Arrange
        const mockDoctor = mockData.generateMockDoctor({
          empID: 'DOC001',
          availability: {
            monday: { start: '09:00', end: '12:00', isAvailable: true }
          }
        });

        setupMockResponse('Doctor', 'findOne', mockDoctor);
        setupMockResponse('Appointment', 'find', []);

        // Act
        const result = await AppointmentBookingController.reserveSlot('DOC001', '2024-01-15', '15:00');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Slot is outside doctor availability');
      });
    });
  });
});
