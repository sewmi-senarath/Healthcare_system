import mongoose from 'mongoose';

/**
 * Appointment Model - Following Single Responsibility Principle
 * Responsible only for appointment management functionality
 * Handles appointments between patients and doctors with approval workflow
 */
const appointmentSchema = new mongoose.Schema({
  appointmentID: {
    type: String,
    required: true,
    unique: true
  },
  patientID: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  doctorID: {
    type: String,
    required: true,
    ref: 'Doctor'
  },
  dateTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending_approval', 'approved', 'confirmed', 'in_progress', 'completed', 'cancelled', 'declined', 'no_show'],
    default: 'pending_approval'
  },
  reasonForVisit: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  appointmentDetails: {
    duration: {
      type: Number,
      default: 30, // minutes
      min: 15,
      max: 120
    },
    appointmentType: {
      type: String,
      enum: ['consultation', 'follow_up', 'emergency', 'routine_checkup', 'specialist_visit', 'procedure'],
      default: 'consultation'
    },
    priority: {
      type: String,
      enum: ['routine', 'urgent', 'emergency'],
      default: 'routine'
    },
    location: {
      hospitalId: String,
      department: String,
      roomNumber: String,
      floor: String,
      building: String
    },
    notes: String,
    specialRequirements: [String], // e.g., 'wheelchair_access', 'interpreter_needed'
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      coverageVerified: {
        type: Boolean,
        default: false
      }
    }
  },
  approvalWorkflow: {
    requestedDate: {
      type: Date,
      default: Date.now
    },
    reviewedBy: String, // HealthCareManager ID
    reviewedByName: String,
    reviewedDate: Date,
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending'
    },
    declineReason: String,
    approvalNotes: String,
    autoApproved: {
      type: Boolean,
      default: false
    },
    requiresManagerApproval: {
      type: Boolean,
      default: true
    }
  },
  notifications: {
    patientNotified: {
      type: Boolean,
      default: false
    },
    doctorNotified: {
      type: Boolean,
      default: false
    },
    managerNotified: {
      type: Boolean,
      default: false
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
    lastNotificationSent: Date
  },
  rescheduling: {
    originalDateTime: Date,
    rescheduleCount: {
      type: Number,
      default: 0,
      max: 3
    },
    rescheduleHistory: [{
      fromDateTime: Date,
      toDateTime: Date,
      reason: String,
      requestedBy: String,
      requestedByName: String,
      rescheduleDate: {
        type: Date,
        default: Date.now
      }
    }]
  },
  cancellation: {
    cancelledBy: String,
    cancelledByName: String,
    cancelledDate: Date,
    cancellationReason: String,
    refundEligible: {
      type: Boolean,
      default: true
    },
    refundAmount: Number
  },
  completion: {
    completedBy: String,
    completedByName: String,
    completedDate: Date,
    duration: Number, // actual duration in minutes
    diagnosis: String,
    treatmentPlan: String,
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date,
    prescriptionIssued: {
      type: Boolean,
      default: false
    },
    prescriptionId: String
  },
  history: [{
    action: {
      type: String,
      enum: ['created', 'approved', 'declined', 'confirmed', 'rescheduled', 'cancelled', 'started', 'completed', 'no_show'],
      required: true
    },
    performedBy: String,
    performedByName: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String,
    data: mongoose.Schema.Types.Mixed
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Instance methods - Interface Segregation Principle
appointmentSchema.methods.scheduleAppointment = function(scheduledBy, scheduledByName, appointmentData) {
  const appointment = {
    appointmentID: this.appointmentID,
    patientID: this.patientID,
    doctorID: this.doctorID,
    dateTime: this.dateTime,
    status: this.status,
    reasonForVisit: this.reasonForVisit,
    appointmentDetails: this.appointmentDetails,
    approvalWorkflow: this.approvalWorkflow,
    message: 'Appointment scheduled successfully'
  };
  
  // Add to history
  this.history.push({
    action: 'created',
    performedBy: scheduledBy,
    performedByName: scheduledByName,
    notes: 'Appointment scheduled',
    data: {
      appointmentType: this.appointmentDetails.appointmentType,
      priority: this.appointmentDetails.priority,
      duration: this.appointmentDetails.duration
    }
  });
  
  return appointment;
};

appointmentSchema.methods.rescheduleAppointment = function(newDateTime, rescheduledBy, rescheduledByName, reason = '') {
  if (this.status === 'completed' || this.status === 'cancelled') {
    throw new Error('Cannot reschedule completed or cancelled appointments');
  }
  
  if (this.rescheduling.rescheduleCount >= 3) {
    throw new Error('Maximum reschedule limit reached');
  }
  
  const originalDateTime = this.dateTime;
  this.dateTime = newDateTime;
  this.status = 'pending_approval'; // Reset to pending approval after reschedule
  this.rescheduling.rescheduleCount += 1;
  this.rescheduling.originalDateTime = this.rescheduling.originalDateTime || originalDateTime;
  this.rescheduling.rescheduleHistory.push({
    fromDateTime: originalDateTime,
    toDateTime: newDateTime,
    reason: reason,
    requestedBy: rescheduledBy,
    requestedByName: rescheduledByName
  });
  this.updatedAt = new Date();
  
  // Add to history
  this.history.push({
    action: 'rescheduled',
    performedBy: rescheduledBy,
    performedByName: rescheduledByName,
    notes: `Rescheduled from ${originalDateTime} to ${newDateTime}. Reason: ${reason}`,
    data: {
      fromDateTime: originalDateTime,
      toDateTime: newDateTime,
      reason: reason,
      rescheduleCount: this.rescheduling.rescheduleCount
    }
  });
  
  return this.save().then(() => ({
    appointmentID: this.appointmentID,
    newDateTime: this.dateTime,
    rescheduleCount: this.rescheduling.rescheduleCount,
    message: 'Appointment rescheduled successfully'
  }));
};

appointmentSchema.methods.cancelAppointment = function(cancelledBy, cancelledByName, reason = '', refundAmount = 0) {
  if (this.status === 'completed' || this.status === 'cancelled') {
    throw new Error('Appointment is already completed or cancelled');
  }
  
  this.status = 'cancelled';
  this.cancellation = {
    cancelledBy: cancelledBy,
    cancelledByName: cancelledByName,
    cancelledDate: new Date(),
    cancellationReason: reason,
    refundEligible: this.getRefundEligibility(),
    refundAmount: refundAmount
  };
  this.updatedAt = new Date();
  
  // Add to history
  this.history.push({
    action: 'cancelled',
    performedBy: cancelledBy,
    performedByName: cancelledByName,
    notes: `Appointment cancelled. Reason: ${reason}`,
    data: {
      reason: reason,
      refundEligible: this.cancellation.refundEligible,
      refundAmount: refundAmount
    }
  });
  
  return this.save();
};

appointmentSchema.methods.notifyParticipants = function(notificationType, notificationData) {
  const notifications = {
    appointmentID: this.appointmentID,
    notificationType: notificationType,
    participants: {
      patient: this.patientID,
      doctor: this.doctorID,
      manager: this.approvalWorkflow.reviewedBy
    },
    notificationData: notificationData,
    timestamp: new Date()
  };
  
  // Update notification status based on type
  switch (notificationType) {
    case 'appointment_scheduled':
      this.notifications.patientNotified = true;
      this.notifications.doctorNotified = true;
      this.notifications.managerNotified = true;
      break;
    case 'appointment_approved':
      this.notifications.patientNotified = true;
      this.notifications.doctorNotified = true;
      break;
    case 'appointment_declined':
      this.notifications.patientNotified = true;
      break;
    case 'appointment_reminder':
      this.notifications.reminderSent = true;
      break;
  }
  
  this.notifications.lastNotificationSent = new Date();
  this.updatedAt = new Date();
  
  return notifications;
};

appointmentSchema.methods.approveAppointment = function(approvedBy, approvedByName, approvalNotes = '') {
  if (this.status !== 'pending_approval') {
    throw new Error('Only pending appointments can be approved');
  }
  
  this.status = 'approved';
  this.approvalWorkflow.approvalStatus = 'approved';
  this.approvalWorkflow.reviewedBy = approvedBy;
  this.approvalWorkflow.reviewedByName = approvedByName;
  this.approvalWorkflow.reviewedDate = new Date();
  this.approvalWorkflow.approvalNotes = approvalNotes;
  this.updatedAt = new Date();
  
  // Add to history
  this.history.push({
    action: 'approved',
    performedBy: approvedBy,
    performedByName: approvedByName,
    notes: approvalNotes,
    data: {
      approvalDate: this.approvalWorkflow.reviewedDate,
      approvalNotes: approvalNotes
    }
  });
  
  return this.save();
};

appointmentSchema.methods.declineAppointment = function(declinedBy, declinedByName, declineReason) {
  if (this.status !== 'pending_approval') {
    throw new Error('Only pending appointments can be declined');
  }
  
  this.status = 'declined';
  this.approvalWorkflow.approvalStatus = 'declined';
  this.approvalWorkflow.reviewedBy = declinedBy;
  this.approvalWorkflow.reviewedByName = declinedByName;
  this.approvalWorkflow.reviewedDate = new Date();
  this.approvalWorkflow.declineReason = declineReason;
  this.updatedAt = new Date();
  
  // Add to history
  this.history.push({
    action: 'declined',
    performedBy: declinedBy,
    performedByName: declinedByName,
    notes: `Appointment declined. Reason: ${declineReason}`,
    data: {
      declineDate: this.approvalWorkflow.reviewedDate,
      declineReason: declineReason
    }
  });
  
  return this.save();
};

appointmentSchema.methods.confirmAppointment = function(confirmedBy, confirmedByName) {
  if (this.status !== 'approved') {
    throw new Error('Only approved appointments can be confirmed');
  }
  
  this.status = 'confirmed';
  this.updatedAt = new Date();
  
  // Add to history
  this.history.push({
    action: 'confirmed',
    performedBy: confirmedBy,
    performedByName: confirmedByName,
    notes: 'Appointment confirmed',
    data: {}
  });
  
  return this.save();
};

appointmentSchema.methods.startAppointment = function(startedBy, startedByName) {
  if (this.status !== 'confirmed') {
    throw new Error('Only confirmed appointments can be started');
  }
  
  this.status = 'in_progress';
  this.updatedAt = new Date();
  
  // Add to history
  this.history.push({
    action: 'started',
    performedBy: startedBy,
    performedByName: startedByName,
    notes: 'Appointment started',
    data: {
      startTime: new Date()
    }
  });
  
  return this.save();
};

appointmentSchema.methods.completeAppointment = function(completedBy, completedByName, completionData) {
  if (this.status !== 'in_progress') {
    throw new Error('Only in-progress appointments can be completed');
  }
  
  this.status = 'completed';
  this.completion = {
    completedBy: completedBy,
    completedByName: completedByName,
    completedDate: new Date(),
    duration: completionData.duration || this.appointmentDetails.duration,
    diagnosis: completionData.diagnosis || '',
    treatmentPlan: completionData.treatmentPlan || '',
    followUpRequired: completionData.followUpRequired || false,
    followUpDate: completionData.followUpDate,
    prescriptionIssued: completionData.prescriptionIssued || false,
    prescriptionId: completionData.prescriptionId
  };
  this.updatedAt = new Date();
  
  // Add to history
  this.history.push({
    action: 'completed',
    performedBy: completedBy,
    performedByName: completedByName,
    notes: 'Appointment completed',
    data: completionData
  });
  
  return this.save();
};

appointmentSchema.methods.markAsNoShow = function(markedBy, markedByName, reason = '') {
  if (this.status === 'completed' || this.status === 'cancelled') {
    throw new Error('Cannot mark completed or cancelled appointments as no-show');
  }
  
  this.status = 'no_show';
  this.updatedAt = new Date();
  
  // Add to history
  this.history.push({
    action: 'no_show',
    performedBy: markedBy,
    performedByName: markedByName,
    notes: `Marked as no-show. Reason: ${reason}`,
    data: {
      reason: reason,
      noShowTime: new Date()
    }
  });
  
  return this.save();
};

appointmentSchema.methods.getRefundEligibility = function() {
  const now = new Date();
  const appointmentTime = new Date(this.dateTime);
  const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);
  
  // Refund eligible if cancelled more than 24 hours before appointment
  return hoursUntilAppointment > 24;
};

appointmentSchema.methods.getAppointmentSummary = function() {
  return {
    appointmentID: this.appointmentID,
    patientID: this.patientID,
    doctorID: this.doctorID,
    dateTime: this.dateTime,
    status: this.status,
    reasonForVisit: this.reasonForVisit,
    appointmentType: this.appointmentDetails.appointmentType,
    priority: this.appointmentDetails.priority,
    duration: this.appointmentDetails.duration,
    rescheduleCount: this.rescheduling.rescheduleCount,
    approvalStatus: this.approvalWorkflow.approvalStatus,
    isRefundEligible: this.getRefundEligibility()
  };
};

appointmentSchema.methods.getAppointmentHistory = function() {
  return this.history.sort((a, b) => b.timestamp - a.timestamp);
};

// Static methods
appointmentSchema.statics.findByAppointmentID = function(appointmentID) {
  return this.findOne({ appointmentID });
};

appointmentSchema.statics.findByPatientID = function(patientID) {
  return this.find({ patientID }).sort({ dateTime: -1 });
};

appointmentSchema.statics.findByDoctorID = function(doctorID) {
  return this.find({ doctorID }).sort({ dateTime: -1 });
};

appointmentSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ dateTime: 1 });
};

appointmentSchema.statics.findPendingApproval = function() {
  return this.find({ 
    status: 'pending_approval',
    'approvalWorkflow.approvalStatus': 'pending'
  }).sort({ dateTime: 1 });
};

appointmentSchema.statics.findApprovedAppointments = function() {
  return this.find({ 
    status: 'approved',
    'approvalWorkflow.approvalStatus': 'approved'
  }).sort({ dateTime: 1 });
};

appointmentSchema.statics.findDeclinedAppointments = function() {
  return this.find({ 
    status: 'declined',
    'approvalWorkflow.approvalStatus': 'declined'
  }).sort({ dateTime: -1 });
};

appointmentSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    dateTime: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ dateTime: 1 });
};

appointmentSchema.statics.findByDoctorAndDate = function(doctorID, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    doctorID: doctorID,
    dateTime: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $nin: ['cancelled', 'declined'] }
  }).sort({ dateTime: 1 });
};

appointmentSchema.statics.findUpcomingAppointments = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    dateTime: {
      $gte: new Date(),
      $lte: futureDate
    },
    status: { $in: ['approved', 'confirmed'] }
  }).sort({ dateTime: 1 });
};

appointmentSchema.statics.getAppointmentStatistics = function(filters = {}) {
  const matchQuery = {};
  
  if (filters.dateFrom || filters.dateTo) {
    matchQuery.dateTime = {};
    if (filters.dateFrom) matchQuery.dateTime.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) matchQuery.dateTime.$lte = new Date(filters.dateTo);
  }
  
  if (filters.doctorID) {
    matchQuery.doctorID = filters.doctorID;
  }
  
  if (filters.patientID) {
    matchQuery.patientID = filters.patientID;
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalAppointments: { $sum: 1 },
        pendingApproval: {
          $sum: { $cond: [{ $eq: ['$status', 'pending_approval'] }, 1, 0] }
        },
        approvedAppointments: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        confirmedAppointments: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        completedAppointments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledAppointments: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        declinedAppointments: {
          $sum: { $cond: [{ $eq: ['$status', 'declined'] }, 1, 0] }
        },
        noShowAppointments: {
          $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
        },
        averageRescheduleCount: {
          $avg: '$rescheduling.rescheduleCount'
        }
      }
    }
  ]);
};

// Pre-save middleware
appointmentSchema.pre('save', function(next) {
  // Generate appointment ID if not provided
  if (!this.appointmentID) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 6);
    this.appointmentID = `APT${timestamp.substring(6)}${random}`.toUpperCase();
  }
  
  // Update updatedAt timestamp
  this.updatedAt = new Date();
  
  // Auto-approve routine appointments if configured
  if (this.appointmentDetails.appointmentType === 'routine_checkup' && 
      this.appointmentDetails.priority === 'routine' &&
      !this.approvalWorkflow.requiresManagerApproval) {
    this.approvalWorkflow.autoApproved = true;
    this.approvalWorkflow.approvalStatus = 'approved';
    this.status = 'approved';
  }
  
  next();
});

// Indexes for better query performance
appointmentSchema.index({ appointmentID: 1 });
appointmentSchema.index({ patientID: 1 });
appointmentSchema.index({ doctorID: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ dateTime: 1 });
appointmentSchema.index({ 'approvalWorkflow.approvalStatus': 1 });
appointmentSchema.index({ 'approvalWorkflow.reviewedBy': 1 });
appointmentSchema.index({ createdAt: -1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
