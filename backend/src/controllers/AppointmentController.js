import AppointmentCoreController from './AppointmentCoreController.js';
import AppointmentBookingController from './AppointmentBookingController.js';
import AppointmentApprovalController from './AppointmentApprovalController.js';
import AppointmentPaymentController from './AppointmentPaymentController.js';
import AppointmentNotificationController from './AppointmentNotificationController.js';

/**
 * AppointmentController - Main controller that delegates to specialized controllers
 * Following Single Responsibility Principle and Facade Pattern
 * This controller acts as a facade to the specialized appointment controllers
 */
class AppointmentController {
  // Core Operations - delegated to AppointmentCoreController
  static async getDepartments() {
    return await AppointmentCoreController.getDepartments();
  }

  static async getDoctorsByDepartment(department) {
    return await AppointmentCoreController.getDoctorsByDepartment(department);
  }

  static async getDoctorById(doctorId) {
    return await AppointmentCoreController.getDoctorById(doctorId);
  }

  static async getPatientAppointments(patientId, user) {
    return await AppointmentCoreController.getPatientAppointments(patientId, user);
  }

  static async getDoctorAppointments(doctorId, user) {
    return await AppointmentCoreController.getDoctorAppointments(doctorId, user);
  }

  static async getAllAppointmentsForManager(user) {
    return await AppointmentCoreController.getAllAppointmentsForManager(user);
  }

  static async updateAppointmentStatus(appointmentId, status, reason, user) {
    return await AppointmentCoreController.updateAppointmentStatus(appointmentId, status, reason, user);
  }

  static async cancelAppointment(appointmentId, user) {
    return await AppointmentCoreController.cancelAppointment(appointmentId, user);
  }

  // Booking Operations - delegated to AppointmentBookingController
  static async getAvailableSlots(doctorId, date) {
    return await AppointmentBookingController.getAvailableSlots(doctorId, date);
  }

  static async reserveSlot(data) {
    return await AppointmentBookingController.reserveSlot(data);
  }

  static async bookAppointment(appointmentData, user) {
    return await AppointmentBookingController.bookAppointment(appointmentData, user);
  }

  // Approval Operations - delegated to AppointmentApprovalController
  static async getPendingApprovalAppointments() {
    return await AppointmentApprovalController.getPendingApprovalAppointments();
  }

  static async approveAppointment(appointmentId, approvalNotes, user) {
    return await AppointmentApprovalController.approveAppointment(appointmentId, approvalNotes, user);
  }

  static async declineAppointment(appointmentId, declineReason, user) {
    return await AppointmentApprovalController.declineAppointment(appointmentId, declineReason, user);
  }

  // Payment Operations - delegated to AppointmentPaymentController
  static async processPayment(appointmentId, paymentData, user) {
    return await AppointmentPaymentController.processPayment(appointmentId, paymentData, user);
  }

  static async simulatePayment(method, amount, details) {
    return await AppointmentPaymentController.simulatePayment(method, amount, details);
  }

  // Notification Operations - delegated to AppointmentNotificationController
  static async sendAppointmentNotifications(appointment, patient, doctor) {
    return await AppointmentNotificationController.sendAppointmentNotifications(appointment, patient, doctor);
  }

  static async sendAppointmentReminders(appointment, reminderType) {
    return await AppointmentNotificationController.sendAppointmentReminders(appointment, reminderType);
  }

  static async sendStatusChangeNotifications(appointment, oldStatus, newStatus) {
    return await AppointmentNotificationController.sendStatusChangeNotifications(appointment, oldStatus, newStatus);
  }

  // Legacy methods for backward compatibility
  static getMockDoctorsByDepartment(department) {
    // Mock data for testing/development
    const mockDoctors = {
      'cardiology': [
        {
          empID: 'DOC2024001',
          name: 'Dr. Sarah Wilson',
          specialization: 'Cardiology',
          department: 'Cardiology',
          phone: '+1234567890',
          consultationFee: 150,
          experience: '15 years',
          todayAppointments: 3,
          maxAppointmentsPerDay: 10
        }
      ],
      'neurology': [
        {
          empID: 'DOC2024002',
          name: 'Dr. Michael Chen',
          specialization: 'Neurology',
          department: 'Neurology',
          phone: '+1234567891',
          consultationFee: 160,
          experience: '12 years',
          todayAppointments: 2,
          maxAppointmentsPerDay: 8
        }
      ]
    };

    return {
      success: true,
      doctors: mockDoctors[department] || []
    };
  }

  static getMockDoctorById(doctorId) {
    const mockDoctors = {
      'DOC2024001': {
        empID: 'DOC2024001',
        name: 'Dr. Sarah Wilson',
        specialization: 'Cardiology',
        department: 'Cardiology',
        phone: '+1234567890',
        consultationFee: 150,
        experience: '15 years',
        todayAppointments: 3,
        maxAppointmentsPerDay: 10,
        availability: {
          monday: { start: '09:00', end: '17:00', isAvailable: true },
          tuesday: { start: '09:00', end: '17:00', isAvailable: true },
          wednesday: { start: '09:00', end: '17:00', isAvailable: true },
          thursday: { start: '09:00', end: '17:00', isAvailable: true },
          friday: { start: '09:00', end: '17:00', isAvailable: true },
          saturday: { start: '09:00', end: '13:00', isAvailable: true },
          sunday: { start: '00:00', end: '00:00', isAvailable: false }
        }
      }
    };

    const doctor = mockDoctors[doctorId];
    if (doctor) {
      return {
        success: true,
        doctor: doctor
      };
    } else {
      return {
        success: false,
        message: 'Doctor not found'
      };
    }
  }
}

export default AppointmentController;