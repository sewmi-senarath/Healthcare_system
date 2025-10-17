/**
 * AppointmentController Booking Tests
 * Tests appointment booking, approval, payment, and notification workflows
 */

import { jest } from '@jest/globals';
import AppointmentController from '../../../controllers/AppointmentController.js';
import { resetControllerMocks } from '../../mocks/controllers.js';

// Mock all dependencies
jest.unstable_mockModule('../../../controllers/AppointmentBookingController.js', () => ({
  default: {
    getAvailableSlots: jest.fn(),
    reserveSlot: jest.fn(),
    bookAppointment: jest.fn()
  }
}));

jest.unstable_mockModule('../../../controllers/AppointmentApprovalController.js', () => ({
  default: {
    getPendingApprovalAppointments: jest.fn(),
    approveAppointment: jest.fn(),
    declineAppointment: jest.fn()
  }
}));

jest.unstable_mockModule('../../../controllers/AppointmentPaymentController.js', () => ({
  default: {
    processPayment: jest.fn(),
    simulatePayment: jest.fn()
  }
}));

jest.unstable_mockModule('../../../controllers/AppointmentNotificationController.js', () => ({
  default: {
    sendAppointmentNotifications: jest.fn(),
    sendAppointmentReminders: jest.fn(),
    sendStatusChangeNotifications: jest.fn()
  }
}));

describe('AppointmentController - Booking Operations', () => {
  let mockAppointmentBookingController;
  let mockAppointmentApprovalController;
  let mockAppointmentPaymentController;
  let mockAppointmentNotificationController;

  beforeEach(async () => {
    jest.clearAllMocks();
    resetControllerMocks();
    
    // Import mocked controllers
    const bookingModule = await import('../../../controllers/AppointmentBookingController.js');
    mockAppointmentBookingController = bookingModule.default;
    
    const approvalModule = await import('../../../controllers/AppointmentApprovalController.js');
    mockAppointmentApprovalController = approvalModule.default;
    
    const paymentModule = await import('../../../controllers/AppointmentPaymentController.js');
    mockAppointmentPaymentController = paymentModule.default;
    
    const notificationModule = await import('../../../controllers/AppointmentNotificationController.js');
    mockAppointmentNotificationController = notificationModule.default;
  });

  describe('getAvailableSlots', () => {
    describe('Positive Cases', () => {
      test('should return available slots for valid doctor and date', async () => {
        // Arrange
        const mockSlots = [
          { time: '09:00', available: true },
          { time: '10:00', available: true },
          { time: '11:00', available: false }
        ];
        
        mockAppointmentBookingController.getAvailableSlots.mockResolvedValue({
          success: true,
          slots: mockSlots
        });

        // Act
        const result = await AppointmentController.getAvailableSlots('DOC001', '2024-01-15');

        // Assert
        expect(mockAppointmentBookingController.getAvailableSlots).toHaveBeenCalledWith('DOC001', '2024-01-15');
        expect(result.success).toBe(true);
        expect(result.slots).toEqual(mockSlots);
      });
    });

    describe('Negative Cases', () => {
      test('should return empty slots for doctor with no availability', async () => {
        // Arrange
        mockAppointmentBookingController.getAvailableSlots.mockResolvedValue({
          success: true,
          slots: [],
          message: 'No available slots for this doctor on the selected date'
        });

        // Act
        const result = await AppointmentController.getAvailableSlots('DOC001', '2024-01-15');

        // Assert
        expect(result.success).toBe(true);
        expect(result.slots).toEqual([]);
        expect(result.message).toBe('No available slots for this doctor on the selected date');
      });
    });

    describe('Error Cases', () => {
      test('should handle slot retrieval errors', async () => {
        // Arrange
        mockAppointmentBookingController.getAvailableSlots.mockResolvedValue({
          success: false,
          message: 'Failed to retrieve available slots'
        });

        // Act
        const result = await AppointmentController.getAvailableSlots('DOC001', '2024-01-15');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to retrieve available slots');
      });
    });
  });

  describe('bookAppointment', () => {
    describe('Positive Cases', () => {
      test('should book appointment successfully', async () => {
        // Arrange
        const appointmentData = {
          patientId: 'PAT001',
          doctorId: 'DOC001',
          date: '2024-01-15',
          time: '10:00',
          type: 'consultation',
          reason: 'Regular checkup'
        };
        
        const mockAppointment = {
          appointmentId: 'APT001',
          ...appointmentData,
          status: 'pending',
          createdAt: new Date()
        };
        
        mockAppointmentBookingController.bookAppointment.mockResolvedValue({
          success: true,
          appointment: mockAppointment
        });

        // Act
        const result = await AppointmentController.bookAppointment(appointmentData);

        // Assert
        expect(mockAppointmentBookingController.bookAppointment).toHaveBeenCalledWith(appointmentData);
        expect(result.success).toBe(true);
        expect(result.appointment).toEqual(mockAppointment);
      });
    });

    describe('Negative Cases', () => {
      test('should fail booking for invalid appointment data', async () => {
        // Arrange
        const invalidAppointmentData = {
          patientId: 'PAT001'
          // Missing required fields
        };
        
        mockAppointmentBookingController.bookAppointment.mockResolvedValue({
          success: false,
          message: 'Missing required appointment details'
        });

        // Act
        const result = await AppointmentController.bookAppointment(invalidAppointmentData);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Missing required appointment details');
      });
    });
  });

  describe('approveAppointment', () => {
    describe('Positive Cases', () => {
      test('should approve appointment successfully', async () => {
        // Arrange
        const appointmentId = 'APT001';
        const approvalData = { notes: 'Appointment approved' };
        
        mockAppointmentApprovalController.approveAppointment.mockResolvedValue({
          success: true,
          message: 'Appointment approved successfully',
          appointment: { id: appointmentId, status: 'approved' }
        });

        // Act
        const result = await AppointmentController.approveAppointment(appointmentId, approvalData);

        // Assert
        expect(mockAppointmentApprovalController.approveAppointment).toHaveBeenCalledWith(appointmentId, approvalData);
        expect(result.success).toBe(true);
        expect(result.message).toBe('Appointment approved successfully');
      });
    });

    describe('Negative Cases', () => {
      test('should fail approval for non-existent appointment', async () => {
        // Arrange
        mockAppointmentApprovalController.approveAppointment.mockResolvedValue({
          success: false,
          message: 'Appointment not found'
        });

        // Act
        const result = await AppointmentController.approveAppointment('NONEXISTENT', {});

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Appointment not found');
      });
    });
  });

  describe('declineAppointment', () => {
    describe('Positive Cases', () => {
      test('should decline appointment successfully', async () => {
        // Arrange
        const appointmentId = 'APT001';
        const declineData = { reason: 'Doctor unavailable' };
        
        mockAppointmentApprovalController.declineAppointment.mockResolvedValue({
          success: true,
          message: 'Appointment declined successfully',
          appointment: { id: appointmentId, status: 'declined' }
        });

        // Act
        const result = await AppointmentController.declineAppointment(appointmentId, declineData);

        // Assert
        expect(mockAppointmentApprovalController.declineAppointment).toHaveBeenCalledWith(appointmentId, declineData);
        expect(result.success).toBe(true);
        expect(result.message).toBe('Appointment declined successfully');
      });
    });

    describe('Negative Cases', () => {
      test('should fail decline for non-existent appointment', async () => {
        // Arrange
        mockAppointmentApprovalController.declineAppointment.mockResolvedValue({
          success: false,
          message: 'Appointment not found'
        });

        // Act
        const result = await AppointmentController.declineAppointment('NONEXISTENT', {});

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Appointment not found');
      });
    });
  });

  describe('processPayment', () => {
    describe('Positive Cases', () => {
      test('should process payment successfully', async () => {
        // Arrange
        const paymentData = {
          appointmentId: 'APT001',
          amount: 150,
          paymentMethod: 'credit_card'
        };
        
        mockAppointmentPaymentController.processPayment.mockResolvedValue({
          success: true,
          message: 'Payment processed successfully',
          payment: {
            id: 'PAY001',
            ...paymentData,
            status: 'completed'
          }
        });

        // Act
        const result = await AppointmentController.processPayment(paymentData);

        // Assert
        expect(mockAppointmentPaymentController.processPayment).toHaveBeenCalledWith(paymentData);
        expect(result.success).toBe(true);
        expect(result.message).toBe('Payment processed successfully');
      });
    });

    describe('Negative Cases', () => {
      test('should fail payment processing for invalid data', async () => {
        // Arrange
        const invalidPaymentData = {
          appointmentId: 'APT001'
          // Missing amount and payment method
        };
        
        mockAppointmentPaymentController.processPayment.mockResolvedValue({
          success: false,
          message: 'Invalid payment data'
        });

        // Act
        const result = await AppointmentController.processPayment(invalidPaymentData);

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid payment data');
      });
    });
  });

  describe('sendAppointmentNotifications', () => {
    describe('Positive Cases', () => {
      test('should send appointment notifications successfully', async () => {
        // Arrange
        const appointmentId = 'APT001';
        const notificationType = 'reminder';
        
        mockAppointmentNotificationController.sendAppointmentNotifications.mockResolvedValue({
          success: true,
          message: 'Notifications sent successfully'
        });

        // Act
        const result = await AppointmentController.sendAppointmentNotifications(appointmentId, notificationType);

        // Assert
        expect(mockAppointmentNotificationController.sendAppointmentNotifications).toHaveBeenCalledWith(appointmentId, notificationType);
        expect(result.success).toBe(true);
        expect(result.message).toBe('Notifications sent successfully');
      });
    });

    describe('Negative Cases', () => {
      test('should fail notification sending for invalid appointment', async () => {
        // Arrange
        mockAppointmentNotificationController.sendAppointmentNotifications.mockResolvedValue({
          success: false,
          message: 'Appointment not found'
        });

        // Act
        const result = await AppointmentController.sendAppointmentNotifications('NONEXISTENT', 'reminder');

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('Appointment not found');
      });
    });
  });
});
