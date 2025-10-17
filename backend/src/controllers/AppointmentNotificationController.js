import Notification from '../models/Notification.js';

/**
 * AppointmentNotificationController - Handles appointment-related notifications
 * Following Single Responsibility Principle - Only handles notification operations
 */
class AppointmentNotificationController {
  /**
   * Send appointment notifications
   * @param {Object} appointment 
   * @param {Object} patient 
   * @param {Object} doctor 
   * @returns {Promise<void>}
   */
  static async sendAppointmentNotifications(appointment, patient, doctor) {
    try {
      // Notification for patient
      const patientNotification = new Notification({
        notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
        recipientId: patient.patientId,
        recipientType: 'patient',
        title: 'Appointment Booked',
        message: `Your appointment with Dr. ${doctor.name} has been booked for ${new Date(appointment.dateTime).toLocaleDateString()}.`,
        type: 'appointment_booking',
        status: 'unread',
        priority: 'high',
        data: {
          appointmentId: appointment.appointmentID,
          doctorName: doctor.name,
          appointmentDate: appointment.dateTime,
          status: appointment.status
        },
        createdAt: new Date()
      });

      await patientNotification.save();

      // Notification for doctor
      const doctorNotification = new Notification({
        notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
        recipientId: doctor.empID,
        recipientType: 'doctor',
        title: 'New Appointment Request',
        message: `New appointment request from ${patient.name} for ${new Date(appointment.dateTime).toLocaleDateString()}.`,
        type: 'appointment_booking',
        status: 'unread',
        priority: 'medium',
        data: {
          appointmentId: appointment.appointmentID,
          patientName: patient.name,
          appointmentDate: appointment.dateTime,
          status: appointment.status,
          reason: appointment.reason
        },
        createdAt: new Date()
      });

      await doctorNotification.save();

      console.log(`Appointment notifications sent for appointment ${appointment.appointmentID}`);
    } catch (error) {
      console.error('Error sending appointment notifications:', error);
    }
  }

  /**
   * Send appointment reminder notifications
   * @param {Object} appointment 
   * @param {string} reminderType 
   * @returns {Promise<void>}
   */
  static async sendAppointmentReminders(appointment, reminderType = '24h') {
    try {
      const appointmentDate = new Date(appointment.dateTime);
      const now = new Date();
      const timeDiff = appointmentDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);

      let reminderMessage = '';
      let reminderTitle = '';

      switch (reminderType) {
        case '24h':
          reminderTitle = 'Appointment Reminder - Tomorrow';
          reminderMessage = `You have an appointment with Dr. ${appointment.doctorID.name} tomorrow at ${appointmentDate.toLocaleTimeString()}.`;
          break;
        case '2h':
          reminderTitle = 'Appointment Reminder - In 2 Hours';
          reminderMessage = `You have an appointment with Dr. ${appointment.doctorID.name} in 2 hours at ${appointmentDate.toLocaleTimeString()}.`;
          break;
        case '30min':
          reminderTitle = 'Appointment Reminder - In 30 Minutes';
          reminderMessage = `You have an appointment with Dr. ${appointment.doctorID.name} in 30 minutes at ${appointmentDate.toLocaleTimeString()}.`;
          break;
        default:
          reminderTitle = 'Appointment Reminder';
          reminderMessage = `You have an upcoming appointment with Dr. ${appointment.doctorID.name} on ${appointmentDate.toLocaleDateString()}.`;
      }

      // Patient reminder
      const patientReminder = new Notification({
        notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
        recipientId: appointment.patientID,
        recipientType: 'patient',
        title: reminderTitle,
        message: reminderMessage,
        type: 'appointment_reminder',
        status: 'unread',
        priority: 'high',
        data: {
          appointmentId: appointment.appointmentID,
          appointmentDate: appointment.dateTime,
          reminderType: reminderType
        },
        createdAt: new Date()
      });

      await patientReminder.save();

      // Doctor reminder
      const doctorReminder = new Notification({
        notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
        recipientId: appointment.doctorID,
        recipientType: 'doctor',
        title: reminderTitle,
        message: `You have an appointment with ${appointment.patientID.name} ${reminderType === '24h' ? 'tomorrow' : reminderType === '2h' ? 'in 2 hours' : 'in 30 minutes'}.`,
        type: 'appointment_reminder',
        status: 'unread',
        priority: 'medium',
        data: {
          appointmentId: appointment.appointmentID,
          appointmentDate: appointment.dateTime,
          reminderType: reminderType
        },
        createdAt: new Date()
      });

      await doctorReminder.save();

      console.log(`${reminderType} reminder notifications sent for appointment ${appointment.appointmentID}`);
    } catch (error) {
      console.error('Error sending appointment reminders:', error);
    }
  }

  /**
   * Send appointment status change notifications
   * @param {Object} appointment 
   * @param {string} oldStatus 
   * @param {string} newStatus 
   * @returns {Promise<void>}
   */
  static async sendStatusChangeNotifications(appointment, oldStatus, newStatus) {
    try {
      const statusMessages = {
        'pending_approval': 'is pending approval',
        'approved': 'has been approved',
        'confirmed': 'has been confirmed',
        'cancelled': 'has been cancelled',
        'completed': 'has been completed',
        'declined': 'has been declined'
      };

      const message = statusMessages[newStatus] || 'status has been updated';

      // Patient notification
      const patientNotification = new Notification({
        notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
        recipientId: appointment.patientID,
        recipientType: 'patient',
        title: 'Appointment Status Update',
        message: `Your appointment with Dr. ${appointment.doctorID.name} ${message}.`,
        type: 'appointment_status_update',
        status: 'unread',
        priority: 'medium',
        data: {
          appointmentId: appointment.appointmentID,
          doctorName: appointment.doctorID.name,
          appointmentDate: appointment.dateTime,
          oldStatus: oldStatus,
          newStatus: newStatus
        },
        createdAt: new Date()
      });

      await patientNotification.save();

      // Doctor notification
      const doctorNotification = new Notification({
        notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
        recipientId: appointment.doctorID,
        recipientType: 'doctor',
        title: 'Appointment Status Update',
        message: `Your appointment with ${appointment.patientID.name} ${message}.`,
        type: 'appointment_status_update',
        status: 'unread',
        priority: 'medium',
        data: {
          appointmentId: appointment.appointmentID,
          patientName: appointment.patientID.name,
          appointmentDate: appointment.dateTime,
          oldStatus: oldStatus,
          newStatus: newStatus
        },
        createdAt: new Date()
      });

      await doctorNotification.save();

      console.log(`Status change notifications sent for appointment ${appointment.appointmentID}`);
    } catch (error) {
      console.error('Error sending status change notifications:', error);
    }
  }
}

export default AppointmentNotificationController;
