/**
 * AppointmentService - Single Responsibility: Business logic for appointments
 * Orchestrates repositories and other services
 */
export class AppointmentService {
  constructor(appointmentRepo, doctorRepo, patientRepo, notificationService, availabilityService) {
    this.appointmentRepo = appointmentRepo;
    this.doctorRepo = doctorRepo;
    this.patientRepo = patientRepo;
    this.notificationService = notificationService;
    this.availabilityService = availabilityService;
  }

  async bookAppointment(appointmentData) {
    const { patientID, doctorID, dateTime, reasonForVisit, department } = appointmentData;

    // Verify patient
    const patient = await this.patientRepo.findById(patientID);
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Verify doctor
    const doctor = await this.doctorRepo.findById(doctorID);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Check availability
    const isAvailable = await this.availabilityService.checkSlotAvailability(
      doctorID, 
      dateTime, 
      this.appointmentRepo
    );
    
    if (!isAvailable) {
      throw new Error('Time slot is no longer available');
    }

    // Create appointment
    const appointment = await this.appointmentRepo.create({
      appointmentID: `APT${Date.now()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
      patientID,
      doctorID,
      dateTime: new Date(dateTime),
      status: 'pending_approval',
      reasonForVisit,
      appointmentDetails: {
        duration: 30,
        appointmentType: 'consultation',
        priority: 'routine',
        location: { department }
      },
      approvalWorkflow: {
        requestedDate: new Date(),
        approvalStatus: 'pending',
        requiresManagerApproval: true,
        autoApproved: false
      },
      consultationFee: doctor.consultationFee || 150,
      paymentMethod: appointmentData.paymentMethod || 'pending',
      paymentStatus: 'pending'
    });

    // Send notifications
    await this.notificationService.sendAppointmentNotification(
      appointment, 
      patient, 
      doctor, 
      'confirmation'
    );

    return appointment;
  }

  async getAvailableSlots(doctorId, date) {
    const doctor = await this.doctorRepo.findById(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    const allSlots = this.availabilityService.generateAvailableSlots(doctor.availability);
    const dateSlots = allSlots.filter(slot => slot.date === date);
    
    const existingAppointments = await this.appointmentRepo.findByDoctorID(doctorId, date);
    
    const availableSlots = dateSlots.map(slot => {
      const slotDateTime = new Date(`${slot.date}T${slot.time}:00.000Z`);
      const hasAppointment = existingAppointments.some(apt => {
        const aptTime = new Date(apt.dateTime);
        return aptTime.getHours() === slotDateTime.getHours();
      });
      
      return { ...slot, available: !hasAppointment };
    });

    return availableSlots;
  }

  async approveAppointment(appointmentId, approverId, approverName, notes) {
    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status !== 'pending_approval') {
      throw new Error('Only pending appointments can be approved');
    }

    await appointment.approveAppointment(approverId, approverName, notes);
    
    const patient = await this.patientRepo.findById(appointment.patientID);
    const doctor = await this.doctorRepo.findById(appointment.doctorID);
    
    await this.notificationService.sendAppointmentNotification(
      appointment,
      patient,
      doctor,
      'approved'
    );

    return appointment;
  }
}