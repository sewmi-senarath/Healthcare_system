import mongoose from 'mongoose';
import User from './User.js';

/**
 * Patient Model - Following Single Responsibility Principle
 * Responsible only for patient-specific functionality
 * Inherits from User base class
 */
const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    }
  },
  medicalHistory: [{
    condition: String,
    diagnosisDate: Date,
    status: {
      type: String,
      enum: ['active', 'resolved', 'chronic'],
      default: 'active'
    },
    notes: String
  }],
  allergies: [{
    allergen: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'moderate'
    },
    notes: String
  }],
  insuranceDetails: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    coverageType: {
      type: String,
      enum: ['primary', 'secondary', 'tertiary']
    }
  },
  digitalHealthCardID: {
    type: String,
    unique: true,
    sparse: true
  }
});

// Instance methods - Interface Segregation Principle
patientSchema.methods.getPatientID = function() {
  return this.patientId;
};

patientSchema.methods.updateProfile = function(updateData) {
  const allowedUpdates = ['contactInfo', 'address', 'insuranceDetails'];
  const updates = {};
  
  allowedUpdates.forEach(field => {
    if (updateData[field]) {
      updates[field] = { ...this[field], ...updateData[field] };
    }
  });
  
  Object.assign(this, updates);
  return this.save();
};

patientSchema.methods.viewMedicalRecords = function() {
  return {
    medicalHistory: this.medicalHistory,
    allergies: this.allergies,
    patientId: this.patientId,
    name: this.name,
    dateOfBirth: this.dateOfBirth
  };
};

patientSchema.methods.bookAppointment = async function(appointmentData) {
  // This would typically interact with an Appointment service
  // Following Dependency Inversion Principle - depends on abstraction
  const appointment = {
    patientId: this.patientId,
    patientName: this.name,
    ...appointmentData,
    bookingDate: new Date(),
    status: 'scheduled'
  };
  
  // In a real application, this would call an Appointment service
  return appointment;
};

patientSchema.methods.makePayment = async function(paymentData) {
  // This would typically interact with a Payment service
  const payment = {
    patientId: this.patientId,
    amount: paymentData.amount,
    paymentMethod: paymentData.paymentMethod,
    transactionDate: new Date(),
    status: 'pending'
  };
  
  // In a real application, this would call a Payment service
  return payment;
};

patientSchema.methods.viewPrescriptions = function() {
  // This would typically fetch from a Prescription service
  return {
    patientId: this.patientId,
    prescriptions: [] // Would be populated from external service
  };
};

patientSchema.methods.raiseSupportTicket = async function(ticketData) {
  // Import SupportTicket model dynamically to avoid circular dependency
  const SupportTicket = (await import('./SupportTicket.js')).default;
  
  const ticketDataWithPatient = {
    patientID: this.patientId,
    issueDescription: ticketData.issueDescription,
    priority: ticketData.priority || 'medium',
    category: ticketData.category || 'general_inquiry',
    tags: ticketData.tags || []
  };
  
  const ticket = new SupportTicket(ticketDataWithPatient);
  await ticket.save();
  
  // Add initial communication from patient
  await ticket.addCommunication(
    ticketData.issueDescription,
    this.patientId,
    'patient',
    false
  );
  
  return ticket.getTicketDetails();
};

patientSchema.methods.viewSupportTickets = async function(status = null) {
  // Import SupportTicket model dynamically to avoid circular dependency
  const SupportTicket = (await import('./SupportTicket.js')).default;
  
  let query = { patientID: this.patientId };
  if (status) {
    query.status = status;
  }
  
  const tickets = await SupportTicket.find(query).sort({ dateCreated: -1 });
  return tickets.map(ticket => ticket.getTicketDetails());
};

patientSchema.methods.addTicketCommunication = async function(ticketID, message) {
  // Import SupportTicket model dynamically to avoid circular dependency
  const SupportTicket = (await import('./SupportTicket.js')).default;
  
  const ticket = await SupportTicket.findOne({ 
    ticketID: ticketID, 
    patientID: this.patientId 
  });
  
  if (!ticket) {
    throw new Error('Ticket not found or access denied');
  }
  
  return await ticket.addCommunication(message, this.patientId, 'patient', false);
};

patientSchema.methods.rateSupportTicket = async function(ticketID, rating, feedback = '') {
  // Import SupportTicket model dynamically to avoid circular dependency
  const SupportTicket = (await import('./SupportTicket.js')).default;
  
  const ticket = await SupportTicket.findOne({ 
    ticketID: ticketID, 
    patientID: this.patientId 
  });
  
  if (!ticket) {
    throw new Error('Ticket not found or access denied');
  }
  
  return await ticket.rateTicket(rating, feedback);
};

// Appointment Management Methods
patientSchema.methods.scheduleAppointment = async function(appointmentData) {
  // Import Appointment and Notification models dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  const Notification = (await import('./Notification.js')).default;
  
  const appointment = new Appointment({
    patientID: this.patientId,
    doctorID: appointmentData.doctorID,
    dateTime: appointmentData.dateTime,
    reasonForVisit: appointmentData.reasonForVisit,
    appointmentDetails: appointmentData.appointmentDetails || {
      duration: 30,
      appointmentType: 'consultation',
      priority: 'routine'
    }
  });
  
  await appointment.save();
  
  // Schedule appointment using the model method
  const scheduledAppointment = appointment.scheduleAppointment(this.patientId, this.name, appointmentData);
  
  // Send notification to patient about appointment scheduling
  const patientNotification = new Notification({
    recipientId: this.patientId,
    recipientType: 'patient',
    message: `Your appointment has been scheduled for ${appointment.dateTime.toLocaleDateString()} at ${appointment.dateTime.toLocaleTimeString()}`,
    type: 'appointment_scheduled',
    priority: 'medium',
    dataSent: {
      appointmentID: appointment.appointmentID,
      doctorID: appointment.doctorID,
      dateTime: appointment.dateTime,
      status: appointment.status
    },
    metadata: {
      senderId: this.patientId,
      senderType: 'patient',
      relatedEntityId: appointment.appointmentID,
      relatedEntityType: 'appointment',
      category: 'medical'
    }
  });
  
  await patientNotification.save();
  await patientNotification.sendNotification(this.patientId, 'patient', ['in_app', 'email']);
  
  return scheduledAppointment;
};

patientSchema.methods.viewAppointments = async function(status = null) {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  let query = { patientID: this.patientId };
  if (status) {
    query.status = status;
  }
  
  const appointments = await Appointment.find(query).sort({ dateTime: -1 });
  return appointments.map(appointment => appointment.getAppointmentSummary());
};

patientSchema.methods.rescheduleAppointment = async function(appointmentID, newDateTime, reason = '') {
  // Import Appointment and Notification models dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  const Notification = (await import('./Notification.js')).default;
  
  const appointment = await Appointment.findByAppointmentID(appointmentID);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  if (appointment.patientID !== this.patientId) {
    throw new Error('You can only reschedule your own appointments');
  }
  
  // Reschedule appointment
  const rescheduleResult = await appointment.rescheduleAppointment(
    newDateTime,
    this.patientId,
    this.name,
    reason
  );
  
  // Send notification to doctor about reschedule
  const doctorNotification = new Notification({
    recipientId: appointment.doctorID,
    recipientType: 'doctor',
    message: `Patient ${this.name} has rescheduled their appointment to ${newDateTime.toLocaleDateString()} at ${newDateTime.toLocaleTimeString()}`,
    type: 'appointment_rescheduled',
    priority: 'medium',
    dataSent: {
      appointmentID: appointment.appointmentID,
      patientName: this.name,
      oldDateTime: appointment.rescheduling.rescheduleHistory[appointment.rescheduling.rescheduleHistory.length - 1].fromDateTime,
      newDateTime: newDateTime,
      reason: reason
    },
    metadata: {
      senderId: this.patientId,
      senderType: 'patient',
      relatedEntityId: appointment.appointmentID,
      relatedEntityType: 'appointment',
      category: 'medical'
    }
  });
  
  await doctorNotification.save();
  await doctorNotification.sendNotification(this.patientId, 'patient', ['in_app', 'email']);
  
  return rescheduleResult;
};

patientSchema.methods.cancelAppointment = async function(appointmentID, reason = '') {
  // Import Appointment and Notification models dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  const Notification = (await import('./Notification.js')).default;
  
  const appointment = await Appointment.findByAppointmentID(appointmentID);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  if (appointment.patientID !== this.patientId) {
    throw new Error('You can only cancel your own appointments');
  }
  
  // Cancel appointment
  await appointment.cancelAppointment(this.patientId, this.name, reason);
  
  // Send notification to doctor about cancellation
  const doctorNotification = new Notification({
    recipientId: appointment.doctorID,
    recipientType: 'doctor',
    message: `Patient ${this.name} has cancelled their appointment scheduled for ${appointment.dateTime.toLocaleDateString()}`,
    type: 'appointment_cancelled',
    priority: 'medium',
    dataSent: {
      appointmentID: appointment.appointmentID,
      patientName: this.name,
      originalDateTime: appointment.dateTime,
      reason: reason,
      refundEligible: appointment.cancellation.refundEligible
    },
    metadata: {
      senderId: this.patientId,
      senderType: 'patient',
      relatedEntityId: appointment.appointmentID,
      relatedEntityType: 'appointment',
      category: 'medical'
    }
  });
  
  await doctorNotification.save();
  await doctorNotification.sendNotification(this.patientId, 'patient', ['in_app', 'email']);
  
  return {
    appointmentID: appointment.appointmentID,
    cancelled: true,
    refundEligible: appointment.cancellation.refundEligible
  };
};

patientSchema.methods.viewAppointmentHistory = async function(appointmentID) {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  const appointment = await Appointment.findByAppointmentID(appointmentID);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  if (appointment.patientID !== this.patientId) {
    throw new Error('You can only view your own appointment history');
  }
  
  return appointment.getAppointmentHistory();
};

patientSchema.methods.confirmAppointment = async function(appointmentID) {
  // Import Appointment and Notification models dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  const Notification = (await import('./Notification.js')).default;
  
  const appointment = await Appointment.findByAppointmentID(appointmentID);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  if (appointment.patientID !== this.patientId) {
    throw new Error('You can only confirm your own appointments');
  }
  
  // Confirm appointment
  await appointment.confirmAppointment(this.patientId, this.name);
  
  // Send notification to doctor about confirmation
  const doctorNotification = new Notification({
    recipientId: appointment.doctorID,
    recipientType: 'doctor',
    message: `Patient ${this.name} has confirmed their appointment for ${appointment.dateTime.toLocaleDateString()}`,
    type: 'appointment_confirmed',
    priority: 'low',
    dataSent: {
      appointmentID: appointment.appointmentID,
      patientName: this.name,
      dateTime: appointment.dateTime
    },
    metadata: {
      senderId: this.patientId,
      senderType: 'patient',
      relatedEntityId: appointment.appointmentID,
      relatedEntityType: 'appointment',
      category: 'medical'
    }
  });
  
  await doctorNotification.save();
  await doctorNotification.sendNotification(this.patientId, 'patient', ['in_app', 'email']);
  
  return {
    appointmentID: appointment.appointmentID,
    confirmed: true,
    status: appointment.status
  };
};

patientSchema.methods.getUpcomingAppointments = async function(days = 30) {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  const appointments = await Appointment.find({
    patientID: this.patientId,
    dateTime: {
      $gte: new Date(),
      $lte: futureDate
    },
    status: { $in: ['approved', 'confirmed'] }
  }).sort({ dateTime: 1 });
  
  return appointments.map(appointment => appointment.getAppointmentSummary());
};

// Static methods
patientSchema.statics.findByPatientId = function(patientId) {
  return this.findOne({ patientId });
};

patientSchema.statics.findByHealthCardId = function(digitalHealthCardID) {
  return this.findOne({ digitalHealthCardID });
};

// Pre-save middleware to generate patient ID if not provided
patientSchema.pre('save', function(next) {
  if (!this.patientId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    this.patientId = `PAT${timestamp.substring(6)}${random}`.toUpperCase();
  }
  next();
});

// Create Patient model using discriminator pattern
const Patient = User.discriminator('patient', patientSchema);

export default Patient;
