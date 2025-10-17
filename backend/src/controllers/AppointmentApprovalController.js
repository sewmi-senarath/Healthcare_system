import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Notification from '../models/Notification.js';

/**
 * AppointmentApprovalController - Handles appointment approval workflow
 * Following Single Responsibility Principle - Only handles approval-related operations
 */
class AppointmentApprovalController {
  /**
   * Get pending approval appointments
   * @returns {Promise<Object>}
   */
  static async getPendingApprovalAppointments() {
    try {
      const appointments = await Appointment.find({ status: 'pending_approval' })
        .populate('patientID', 'name email phone')
        .populate('doctorID', 'name specialization department')
        .sort({ createdAt: -1 });

      return {
        success: true,
        appointments: appointments
      };
    } catch (error) {
      console.error('Error getting pending approval appointments:', error);
      return {
        success: false,
        message: 'Failed to retrieve pending appointments'
      };
    }
  }

  /**
   * Approve an appointment
   * @param {string} appointmentId 
   * @param {string} approvalNotes 
   * @param {Object} user 
   * @returns {Promise<Object>}
   */
  static async approveAppointment(appointmentId, approvalNotes, user) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('patientID', 'name email phone')
        .populate('doctorID', 'name specialization department');

      if (!appointment) {
        return {
          success: false,
          message: 'Appointment not found'
        };
      }

      if (appointment.status !== 'pending_approval') {
        return {
          success: false,
          message: 'Appointment is not pending approval'
        };
      }

      // Update appointment status
      appointment.status = 'approved';
      appointment.approvalNotes = approvalNotes;
      appointment.approvedBy = user.empID;
      appointment.approvedAt = new Date();
      appointment.lastUpdatedBy = user.empID;
      appointment.lastUpdatedAt = new Date();

      await appointment.save();

      // Send notifications
      await this.sendApprovalNotifications(appointment, 'approved', approvalNotes);

      return {
        success: true,
        message: 'Appointment approved successfully',
        appointment: appointment
      };
    } catch (error) {
      console.error('Error approving appointment:', error);
      return {
        success: false,
        message: 'Failed to approve appointment'
      };
    }
  }

  /**
   * Decline an appointment
   * @param {string} appointmentId 
   * @param {string} declineReason 
   * @param {Object} user 
   * @returns {Promise<Object>}
   */
  static async declineAppointment(appointmentId, declineReason, user) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('patientID', 'name email phone')
        .populate('doctorID', 'name specialization department');

      if (!appointment) {
        return {
          success: false,
          message: 'Appointment not found'
        };
      }

      if (appointment.status !== 'pending_approval') {
        return {
          success: false,
          message: 'Appointment is not pending approval'
        };
      }

      // Update appointment status
      appointment.status = 'declined';
      appointment.declineReason = declineReason;
      appointment.declinedBy = user.empID;
      appointment.declinedAt = new Date();
      appointment.lastUpdatedBy = user.empID;
      appointment.lastUpdatedAt = new Date();

      await appointment.save();

      // Send notifications
      await this.sendApprovalNotifications(appointment, 'declined', declineReason);

      return {
        success: true,
        message: 'Appointment declined successfully',
        appointment: appointment
      };
    } catch (error) {
      console.error('Error declining appointment:', error);
      return {
        success: false,
        message: 'Failed to decline appointment'
      };
    }
  }

  /**
   * Send approval notifications
   * @param {Object} appointment 
   * @param {string} action 
   * @param {string} notes 
   * @returns {Promise<void>}
   */
  static async sendApprovalNotifications(appointment, action, notes) {
    try {
      const actionText = action === 'approved' ? 'approved' : 'declined';
      const statusColor = action === 'approved' ? 'green' : 'red';

      // Notification for patient
      const patientNotification = new Notification({
        notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
        recipientId: appointment.patientID.patientId,
        recipientType: 'patient',
        title: `Appointment ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
        message: `Your appointment with Dr. ${appointment.doctorID.name} has been ${actionText}.`,
        type: 'appointment_update',
        status: 'unread',
        priority: 'medium',
        data: {
          appointmentId: appointment.appointmentID,
          doctorName: appointment.doctorID.name,
          appointmentDate: appointment.dateTime,
          action: action,
          notes: notes
        },
        createdAt: new Date()
      });

      await patientNotification.save();

      // Notification for doctor
      const doctorNotification = new Notification({
        notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
        recipientId: appointment.doctorID.empID,
        recipientType: 'doctor',
        title: `Appointment ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
        message: `Your appointment with ${appointment.patientID.name} has been ${actionText}.`,
        type: 'appointment_update',
        status: 'unread',
        priority: 'medium',
        data: {
          appointmentId: appointment.appointmentID,
          patientName: appointment.patientID.name,
          appointmentDate: appointment.dateTime,
          action: action,
          notes: notes
        },
        createdAt: new Date()
      });

      await doctorNotification.save();

      console.log(`Approval notifications sent for appointment ${appointment.appointmentID}`);
    } catch (error) {
      console.error('Error sending approval notifications:', error);
    }
  }
}

export default AppointmentApprovalController;
