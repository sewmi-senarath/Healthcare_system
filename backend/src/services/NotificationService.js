/**
 * NotificationService - Single Responsibility: Handle ALL notifications
 * Extracted from AppointmentController, EmployeeController, etc.
 */
export class NotificationService {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async sendAppointmentNotification(appointment, patient, doctor, type) {
    const notifications = [];

    // Patient notification
    const patientNotif = await this.createNotification({
      recipientId: patient._id || patient.patientId,
      recipientType: 'patient',
      message: this.getAppointmentMessage(type, appointment, doctor),
      type: `appointment_${type}`,
      priority: 'medium',
      dataSent: { appointmentID: appointment.appointmentID },
      metadata: {
        relatedEntityId: appointment.appointmentID,
        relatedEntityType: 'appointment',
        category: 'medical'
      }
    });
    notifications.push(patientNotif);

    // Doctor notification
    const doctorNotif = await this.createNotification({
      recipientId: doctor._id || doctor.empID,
      recipientType: 'doctor',
      message: this.getDoctorAppointmentMessage(type, appointment, patient),
      type: `appointment_${type}`,
      priority: 'medium',
      dataSent: { appointmentID: appointment.appointmentID },
      metadata: {
        relatedEntityId: appointment.appointmentID,
        relatedEntityType: 'appointment',
        category: 'medical'
      }
    });
    notifications.push(doctorNotif);

    return notifications;
  }

  async createNotification(notificationData) {
    return await this.notificationRepository.create(notificationData);
  }

  getAppointmentMessage(type, appointment, doctor) {
    const messages = {
      'confirmation': `Your appointment with Dr. ${doctor.name} has been booked for ${appointment.dateTime.toLocaleDateString()}`,
      'approved': `Your appointment has been approved`,
      'declined': `Your appointment request has been declined`,
      'reminder': `Reminder: Appointment with Dr. ${doctor.name} tomorrow`
    };
    return messages[type] || 'Appointment update';
  }

  getDoctorAppointmentMessage(type, appointment, patient) {
    const messages = {
      'confirmation': `New appointment with ${patient.name} scheduled`,
      'cancelled': `Appointment with ${patient.name} has been cancelled`
    };
    return messages[type] || 'Appointment update';
  }
}
