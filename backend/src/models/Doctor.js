import mongoose from 'mongoose';
import User from './User.js';
import employeeBaseSchema from './Employee.js';

/**
 * Doctor Model - Following Single Responsibility Principle
 * Responsible only for doctor-specific functionality
 * Extends the base employee schema
 */
const doctorSchema = new mongoose.Schema({
  specialization: {
    type: String,
    required: true,
    enum: [
      'cardiology', 'neurology', 'oncology', 'pediatrics', 'surgery',
      'orthopedics', 'dermatology', 'psychiatry', 'radiology', 'anesthesiology',
      'emergency_medicine', 'family_medicine', 'internal_medicine', 'gynecology',
      'urology', 'ophthalmology', 'otolaryngology', 'pathology', 'pulmonology'
    ]
  },
  availability: {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }]
  },
  assignedHospitalID: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  whatsApp: {
    type: String
  },
  preferredCommunicationMethod: {
    type: String,
    enum: ['email', 'phone', 'whatsapp', 'sms'],
    default: 'email'
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  maxPatientsPerDay: {
    type: Number,
    default: 20
  },
  currentPatientCount: {
    type: Number,
    default: 0
  },
  ratings: [{
    patientId: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  }
});

// Instance methods - Interface Segregation Principle
doctorSchema.methods.viewAppointment = function(appointmentId) {
  // This would typically fetch from appointment service
  return {
    appointmentId: appointmentId,
    doctorId: this.empID,
    doctorName: this.name,
    specialization: this.specialization
  };
};

doctorSchema.methods.viewAppointments = function(date) {
  // This would typically fetch from appointment service
  return {
    doctorId: this.empID,
    doctorName: this.name,
    date: date,
    appointments: []
  };
};

doctorSchema.methods.updateAvailability = function(day, timeSlots) {
  if (this.availability[day]) {
    this.availability[day] = timeSlots;
  }
  return this.save();
};

doctorSchema.methods.createPrescription = function(prescriptionData) {
  const prescription = {
    prescriptionId: `PRES${Date.now()}`,
    doctorId: this.empID,
    doctorName: this.name,
    doctorSpecialization: this.specialization,
    patientId: prescriptionData.patientId,
    medications: prescriptionData.medications,
    instructions: prescriptionData.instructions,
    createdDate: new Date(),
    status: 'active'
  };
  
  // In a real application, this would call prescription service
  return prescription;
};

// Prescription Management Methods
doctorSchema.methods.generatePrescription = async function(prescriptionData) {
  // Import Prescription and Notification models dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  const Notification = (await import('./Notification.js')).default;
  
  const prescription = new Prescription({
    patientID: prescriptionData.patientID,
    doctorId: this.empID,
    medicineList: prescriptionData.medicineList,
    dosageInstruction: prescriptionData.dosageInstruction,
    prescriptionDetails: prescriptionData.prescriptionDetails,
    validation: prescriptionData.validation,
    pricing: prescriptionData.pricing
  });
  
  await prescription.save();
  
  // Generate prescription using the model method
  const generatedPrescription = prescription.generatePrescription({
    doctorName: this.name
  });
  
  // Send notification to patient about prescription creation
  const patientNotification = new Notification({
    recipientId: prescriptionData.patientID,
    recipientType: 'patient',
    message: `New prescription has been created for you by Dr. ${this.name}`,
    type: 'prescription_created',
    priority: 'medium',
    dataSent: {
      prescriptionID: prescription.prescriptionID,
      doctorName: this.name,
      medicineCount: prescription.medicineList.length
    },
    metadata: {
      senderId: this.empID,
      senderType: 'doctor',
      relatedEntityId: prescription.prescriptionID,
      relatedEntityType: 'prescription',
      category: 'medical'
    }
  });
  
  await patientNotification.save();
  await patientNotification.sendNotification(this.empID, 'doctor', ['in_app', 'email']);
  
  return generatedPrescription;
};

doctorSchema.methods.sendPrescriptionToPharmacy = async function(prescriptionID, pharmacyId, pharmacistId) {
  // Import Prescription and Notification models dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  const Notification = (await import('./Notification.js')).default;
  
  const prescription = await Prescription.findByPrescriptionID(prescriptionID);
  
  if (!prescription) {
    throw new Error('Prescription not found');
  }
  
  if (prescription.doctorId !== this.empID) {
    throw new Error('You can only send your own prescriptions');
  }
  
  // Send prescription to pharmacy
  await prescription.sendToPharmacy(pharmacyId, pharmacistId, this.empID, this.name);
  
  // Send notification to pharmacist
  const pharmacistNotification = new Notification({
    recipientId: pharmacistId,
    recipientType: 'pharmacist',
    message: `New prescription from Dr. ${this.name} requires your attention`,
    type: 'prescription_sent_to_pharmacy',
    priority: 'high',
    dataSent: {
      prescriptionID: prescription.prescriptionID,
      patientID: prescription.patientID,
      doctorName: this.name,
      medicineCount: prescription.medicineList.length,
      urgency: prescription.prescriptionDetails.urgency
    },
    metadata: {
      senderId: this.empID,
      senderType: 'doctor',
      relatedEntityId: prescription.prescriptionID,
      relatedEntityType: 'prescription',
      category: 'medical'
    }
  });
  
  await pharmacistNotification.save();
  await pharmacistNotification.sendNotification(this.empID, 'doctor', ['in_app', 'email']);
  
  // Send notification to patient
  const patientNotification = new Notification({
    recipientId: prescription.patientID,
    recipientType: 'patient',
    message: `Your prescription has been sent to the pharmacy and is being prepared`,
    type: 'prescription_sent_to_pharmacy',
    priority: 'medium',
    dataSent: {
      prescriptionID: prescription.prescriptionID,
      pharmacyId: pharmacyId
    },
    metadata: {
      senderId: this.empID,
      senderType: 'doctor',
      relatedEntityId: prescription.prescriptionID,
      relatedEntityType: 'prescription',
      category: 'medical'
    }
  });
  
  await patientNotification.save();
  await patientNotification.sendNotification(this.empID, 'doctor', ['in_app', 'email']);
  
  return {
    prescriptionID: prescription.prescriptionID,
    status: prescription.status,
    sentToPharmacy: true,
    notificationsSent: ['pharmacist', 'patient']
  };
};

doctorSchema.methods.viewPrescription = async function(prescriptionID) {
  // Import Prescription model dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  
  const prescription = await Prescription.findByPrescriptionID(prescriptionID);
  
  if (!prescription) {
    throw new Error('Prescription not found');
  }
  
  if (prescription.doctorId !== this.empID) {
    throw new Error('You can only view your own prescriptions');
  }
  
  return prescription.viewPrescription(this.empID, 'doctor');
};

doctorSchema.methods.updatePrescription = async function(prescriptionID, updateData) {
  // Import Prescription model dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  
  const prescription = await Prescription.findByPrescriptionID(prescriptionID);
  
  if (!prescription) {
    throw new Error('Prescription not found');
  }
  
  if (prescription.doctorId !== this.empID) {
    throw new Error('You can only update your own prescriptions');
  }
  
  if (prescription.status === 'dispensed' || prescription.status === 'completed') {
    throw new Error('Cannot update dispensed or completed prescriptions');
  }
  
  return await prescription.updatePrescription(updateData, this.empID, this.name);
};

doctorSchema.methods.viewPatientPrescriptions = async function(patientID) {
  // Import Prescription model dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  
  const prescriptions = await Prescription.find({ 
    patientID: patientID, 
    doctorId: this.empID 
  }).sort({ dateIssued: -1 });
  
  return prescriptions.map(prescription => prescription.viewPrescription(this.empID, 'doctor'));
};

doctorSchema.methods.viewDoctorPrescriptions = async function(filters = {}) {
  // Import Prescription model dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  
  let query = { doctorId: this.empID };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.dateFrom || filters.dateTo) {
    query.dateIssued = {};
    if (filters.dateFrom) query.dateIssued.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.dateIssued.$lte = new Date(filters.dateTo);
  }
  
  const prescriptions = await Prescription.find(query).sort({ dateIssued: -1 });
  return prescriptions.map(prescription => prescription.viewPrescription(this.empID, 'doctor'));
};

doctorSchema.methods.cancelPrescription = async function(prescriptionID, reason = '') {
  // Import Prescription and Notification models dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  const Notification = (await import('./Notification.js')).default;
  
  const prescription = await Prescription.findByPrescriptionID(prescriptionID);
  
  if (!prescription) {
    throw new Error('Prescription not found');
  }
  
  if (prescription.doctorId !== this.empID) {
    throw new Error('You can only cancel your own prescriptions');
  }
  
  // Cancel prescription
  await prescription.cancelPrescription(this.empID, this.name, reason);
  
  // Send notification to patient
  const patientNotification = new Notification({
    recipientId: prescription.patientID,
    recipientType: 'patient',
    message: `Your prescription has been cancelled by Dr. ${this.name}`,
    type: 'prescription_cancelled',
    priority: 'medium',
    dataSent: {
      prescriptionID: prescription.prescriptionID,
      doctorName: this.name,
      reason: reason
    },
    metadata: {
      senderId: this.empID,
      senderType: 'doctor',
      relatedEntityId: prescription.prescriptionID,
      relatedEntityType: 'prescription',
      category: 'medical'
    }
  });
  
  await patientNotification.save();
  await patientNotification.sendNotification(this.empID, 'doctor', ['in_app', 'email']);
  
  return {
    prescriptionID: prescription.prescriptionID,
    status: prescription.status,
    cancelled: true
  };
};

doctorSchema.methods.getPrescriptionStatistics = async function(filters = {}) {
  // Import Prescription model dynamically to avoid circular dependency
  const Prescription = (await import('./Prescription.js')).default;
  
  const stats = await Prescription.getPrescriptionStatistics({
    ...filters,
    doctorId: this.empID
  });
  
  return stats[0] || {
    totalPrescriptions: 0,
    pendingPrescriptions: 0,
    sentToPharmacy: 0,
    dispensedPrescriptions: 0,
    completedPrescriptions: 0,
    cancelledPrescriptions: 0
  };
};

// Appointment Management Methods
doctorSchema.methods.viewAppointments = async function(status = null, date = null) {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  let query = { doctorID: this.empID };
  
  if (status) {
    query.status = status;
  }
  
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    query.dateTime = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }
  
  const appointments = await Appointment.find(query).sort({ dateTime: 1 });
  return appointments.map(appointment => appointment.getAppointmentSummary());
};

doctorSchema.methods.viewAppointment = async function(appointmentID) {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  const appointment = await Appointment.findByAppointmentID(appointmentID);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  if (appointment.doctorID !== this.empID) {
    throw new Error('You can only view your own appointments');
  }
  
  return appointment.getAppointmentSummary();
};

doctorSchema.methods.startAppointment = async function(appointmentID) {
  // Import Appointment and Notification models dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  const Notification = (await import('./Notification.js')).default;
  
  const appointment = await Appointment.findByAppointmentID(appointmentID);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  if (appointment.doctorID !== this.empID) {
    throw new Error('You can only start your own appointments');
  }
  
  // Start appointment
  await appointment.startAppointment(this.empID, this.name);
  
  // Send notification to patient
  const patientNotification = new Notification({
    recipientId: appointment.patientID,
    recipientType: 'patient',
    message: `Dr. ${this.name} has started your appointment`,
    type: 'appointment_started',
    priority: 'low',
    dataSent: {
      appointmentID: appointment.appointmentID,
      doctorName: this.name,
      startTime: new Date()
    },
    metadata: {
      senderId: this.empID,
      senderType: 'doctor',
      relatedEntityId: appointment.appointmentID,
      relatedEntityType: 'appointment',
      category: 'medical'
    }
  });
  
  await patientNotification.save();
  await patientNotification.sendNotification(this.empID, 'doctor', ['in_app']);
  
  return {
    appointmentID: appointment.appointmentID,
    started: true,
    status: appointment.status,
    startTime: new Date()
  };
};

doctorSchema.methods.completeAppointment = async function(appointmentID, completionData) {
  // Import Appointment and Notification models dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  const Notification = (await import('./Notification.js')).default;
  
  const appointment = await Appointment.findByAppointmentID(appointmentID);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  if (appointment.doctorID !== this.empID) {
    throw new Error('You can only complete your own appointments');
  }
  
  // Complete appointment
  await appointment.completeAppointment(this.empID, this.name, completionData);
  
  // Send notification to patient
  const patientNotification = new Notification({
    recipientId: appointment.patientID,
    recipientType: 'patient',
    message: `Your appointment with Dr. ${this.name} has been completed`,
    type: 'appointment_completed',
    priority: 'medium',
    dataSent: {
      appointmentID: appointment.appointmentID,
      doctorName: this.name,
      completionTime: appointment.completion.completedDate,
      diagnosis: completionData.diagnosis,
      followUpRequired: completionData.followUpRequired
    },
    metadata: {
      senderId: this.empID,
      senderType: 'doctor',
      relatedEntityId: appointment.appointmentID,
      relatedEntityType: 'appointment',
      category: 'medical'
    }
  });
  
  await patientNotification.save();
  await patientNotification.sendNotification(this.empID, 'doctor', ['in_app', 'email']);
  
  return {
    appointmentID: appointment.appointmentID,
    completed: true,
    status: appointment.status,
    completionTime: appointment.completion.completedDate
  };
};

doctorSchema.methods.markAppointmentAsNoShow = async function(appointmentID, reason = '') {
  // Import Appointment and Notification models dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  const Notification = (await import('./Notification.js')).default;
  
  const appointment = await Appointment.findByAppointmentID(appointmentID);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  if (appointment.doctorID !== this.empID) {
    throw new Error('You can only mark your own appointments as no-show');
  }
  
  // Mark as no-show
  await appointment.markAsNoShow(this.empID, this.name, reason);
  
  // Send notification to patient
  const patientNotification = new Notification({
    recipientId: appointment.patientID,
    recipientType: 'patient',
    message: `You missed your appointment with Dr. ${this.name}. Please reschedule if needed.`,
    type: 'appointment_no_show',
    priority: 'medium',
    dataSent: {
      appointmentID: appointment.appointmentID,
      doctorName: this.name,
      missedDateTime: appointment.dateTime,
      reason: reason
    },
    metadata: {
      senderId: this.empID,
      senderType: 'doctor',
      relatedEntityId: appointment.appointmentID,
      relatedEntityType: 'appointment',
      category: 'medical'
    }
  });
  
  await patientNotification.save();
  await patientNotification.sendNotification(this.empID, 'doctor', ['in_app', 'email', 'sms']);
  
  return {
    appointmentID: appointment.appointmentID,
    markedAsNoShow: true,
    status: appointment.status
  };
};

doctorSchema.methods.getTodaysAppointments = async function() {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  const today = new Date();
  const appointments = await Appointment.findByDoctorAndDate(this.empID, today);
  
  return appointments.map(appointment => appointment.getAppointmentSummary());
};

doctorSchema.methods.getUpcomingAppointments = async function(days = 7) {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  const appointments = await Appointment.find({
    doctorID: this.empID,
    dateTime: {
      $gte: new Date(),
      $lte: futureDate
    },
    status: { $in: ['approved', 'confirmed'] }
  }).sort({ dateTime: 1 });
  
  return appointments.map(appointment => appointment.getAppointmentSummary());
};

doctorSchema.methods.viewAppointmentHistory = async function(appointmentID) {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  const appointment = await Appointment.findByAppointmentID(appointmentID);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  if (appointment.doctorID !== this.empID) {
    throw new Error('You can only view your own appointment history');
  }
  
  return appointment.getAppointmentHistory();
};

doctorSchema.methods.getAppointmentStatistics = async function(filters = {}) {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  const stats = await Appointment.getAppointmentStatistics({
    ...filters,
    doctorID: this.empID
  });
  
  return stats[0] || {
    totalAppointments: 0,
    pendingApproval: 0,
    approvedAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    declinedAppointments: 0,
    noShowAppointments: 0
  };
};

doctorSchema.methods.checkAvailability = async function(date, time) {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  const requestedDateTime = new Date(date);
  const [hours, minutes] = time.split(':');
  requestedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  const endTime = new Date(requestedDateTime);
  endTime.setMinutes(endTime.getMinutes() + 30); // Default 30-minute slot
  
  // Check for conflicts
  const conflictingAppointments = await Appointment.find({
    doctorID: this.empID,
    dateTime: {
      $gte: requestedDateTime,
      $lt: endTime
    },
    status: { $nin: ['cancelled', 'declined', 'no_show'] }
  });
  
  const isAvailable = conflictingAppointments.length === 0;
  
  return {
    available: isAvailable,
    requestedDateTime: requestedDateTime,
    conflictingAppointments: conflictingAppointments.length,
    doctorSchedule: {
      maxPatientsPerDay: this.maxPatientsPerDay,
      currentPatientCount: this.currentPatientCount
    }
  };
};

doctorSchema.methods.accessPatientRecord = function(patientId) {
  // This would typically fetch from patient record service
  return {
    patientId: patientId,
    accessedBy: this.empID,
    accessedByName: this.name,
    accessDate: new Date(),
    purpose: 'medical_review'
  };
};

doctorSchema.methods.updateContact = function(contactData) {
  const allowedFields = ['phone', 'whatsApp', 'preferredCommunicationMethod'];
  const updates = {};
  
  allowedFields.forEach(field => {
    if (contactData[field]) {
      updates[field] = contactData[field];
    }
  });
  
  Object.assign(this, updates);
  return this.save();
};

doctorSchema.methods.addRating = function(patientId, rating, review) {
  this.ratings.push({
    patientId: patientId,
    rating: rating,
    review: review,
    date: new Date()
  });
  
  // Recalculate average rating
  const totalRatings = this.ratings.length;
  const sumRatings = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
  this.averageRating = sumRatings / totalRatings;
  
  return this.save();
};

doctorSchema.methods.checkAvailability = function(date, time) {
  const dayOfWeek = new Date(date).toLocaleLowerCase();
  const dayAvailability = this.availability[dayOfWeek];
  
  if (!dayAvailability || dayAvailability.length === 0) {
    return false;
  }
  
  return dayAvailability.some(slot => {
    return time >= slot.start && time <= slot.end;
  });
};

doctorSchema.methods.canAcceptNewPatient = function() {
  return this.currentPatientCount < this.maxPatientsPerDay;
};

doctorSchema.methods.getDoctorProfile = function() {
  return {
    empID: this.empID,
    name: this.name,
    email: this.email,
    specialization: this.specialization,
    licenseNumber: this.licenseNumber,
    assignedHospitalID: this.assignedHospitalID,
    consultationFee: this.consultationFee,
    averageRating: this.averageRating,
    totalRatings: this.ratings.length,
    availability: this.availability,
    phone: this.phone,
    preferredCommunicationMethod: this.preferredCommunicationMethod
  };
};

// Static methods
doctorSchema.statics.findBySpecialization = function(specialization) {
  return this.find({ specialization, status: 'active' });
};

doctorSchema.statics.findByHospital = function(hospitalID) {
  return this.find({ assignedHospitalID: hospitalID, status: 'active' });
};

doctorSchema.statics.findAvailableDoctors = function(date, time) {
  return this.find({
    status: 'active',
    currentPatientCount: { $lt: '$maxPatientsPerDay' }
  });
};

// Pre-save middleware
doctorSchema.pre('save', function(next) {
  // Generate license number if not provided
  if (!this.licenseNumber) {
    const timestamp = Date.now().toString();
    this.licenseNumber = `DOC${timestamp.substring(6)}`;
  }
  next();
});

// Merge employee base schema with doctor schema
const mergedDoctorSchema = new mongoose.Schema({
  ...employeeBaseSchema.obj,
  ...doctorSchema.obj
});

// Copy methods from employee base schema
Object.assign(mergedDoctorSchema.methods, employeeBaseSchema.methods);
Object.assign(mergedDoctorSchema.statics, employeeBaseSchema.statics);

// Add doctor-specific methods
Object.assign(mergedDoctorSchema.methods, doctorSchema.methods);

// Create Doctor model using discriminator pattern on User
const Doctor = User.discriminator('doctor', mergedDoctorSchema);

export default Doctor;
