import mongoose from 'mongoose';

/**
 * Prescription Model - Following Single Responsibility Principle
 * Responsible only for prescription management functionality
 * Handles prescriptions written by doctors for patients
 */
const prescriptionSchema = new mongoose.Schema({
  prescriptionID: {
    type: String,
    required: true,
    unique: true
  },
  patientID: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  doctorId: {
    type: String,
    required: true,
    ref: 'Doctor'
  },
  dateIssued: {
    type: Date,
    required: true,
    default: Date.now
  },
  medicineList: [{
    medicineId: {
      type: String,
      required: true
    },
    medicineName: {
      type: String,
      required: true
    },
    strength: String,
    dosageForm: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    dosageInstruction: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true // e.g., "twice daily", "once daily", "as needed"
    },
    duration: {
      type: String,
      required: true // e.g., "7 days", "2 weeks", "until finished"
    },
    specialInstructions: String,
    refillsAllowed: {
      type: Number,
      default: 0,
      min: 0
    },
    refillsUsed: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  dosageInstruction: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent_to_pharmacy', 'dispensed', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  prescriptionDetails: {
    diagnosis: String,
    symptoms: [String],
    notes: String,
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'emergency'],
      default: 'routine'
    }
  },
  pharmacyInfo: {
    sentToPharmacy: {
      type: Boolean,
      default: false
    },
    pharmacyId: String,
    pharmacistId: String,
    sentDate: Date,
    receivedDate: Date,
    dispensedDate: Date,
    dispensingPharmacist: String
  },
  validation: {
    isValid: {
      type: Boolean,
      default: true
    },
    validationErrors: [String],
    validatedBy: String,
    validationDate: Date,
    drugInteractions: [{
      medicine1: String,
      medicine2: String,
      severity: String,
      description: String
    }],
    allergies: [{
      allergen: String,
      severity: String,
      notes: String
    }]
  },
  pricing: {
    totalCost: Number,
    insuranceCoverage: Number,
    patientCopay: Number,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partially_paid', 'insurance_pending'],
      default: 'pending'
    }
  },
  history: [{
    action: {
      type: String,
      enum: ['created', 'sent_to_pharmacy', 'dispensed', 'refilled', 'cancelled', 'modified', 'completed'],
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
  expiryDate: {
    type: Date,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Instance methods - Interface Segregation Principle
prescriptionSchema.methods.generatePrescription = function(prescriptionData) {
  // This method is typically called when creating a new prescription
  const prescription = {
    prescriptionID: this.prescriptionID,
    patientID: this.patientID,
    doctorId: this.doctorId,
    dateIssued: this.dateIssued,
    medicineList: this.medicineList,
    dosageInstruction: this.dosageInstruction,
    status: this.status,
    prescriptionDetails: this.prescriptionDetails,
    message: 'Prescription generated successfully'
  };
  
  // Add to history
  this.history.push({
    action: 'created',
    performedBy: this.doctorId,
    performedByName: prescriptionData.doctorName || 'Doctor',
    notes: 'Prescription created',
    data: {
      medicineCount: this.medicineList.length,
      urgency: this.prescriptionDetails.urgency
    }
  });
  
  return prescription;
};

prescriptionSchema.methods.viewPrescription = function(viewedBy, viewerType) {
  const prescription = {
    prescriptionID: this.prescriptionID,
    patientID: this.patientID,
    doctorId: this.doctorId,
    dateIssued: this.dateIssued,
    medicineList: this.medicineList,
    dosageInstruction: this.dosageInstruction,
    status: this.status,
    prescriptionDetails: this.prescriptionDetails,
    pharmacyInfo: this.pharmacyInfo,
    validation: this.validation,
    pricing: this.pricing,
    expiryDate: this.expiryDate,
    lastUpdated: this.lastUpdated
  };
  
  // Add view to history
  this.history.push({
    action: 'viewed',
    performedBy: viewedBy,
    performedByName: viewerType,
    notes: `Prescription viewed by ${viewerType}`,
    data: { viewerType: viewerType }
  });
  
  return prescription;
};

prescriptionSchema.methods.updatePrescription = function(updateData, updatedBy, updatedByName) {
  const allowedUpdates = [
    'medicineList',
    'dosageInstruction',
    'prescriptionDetails',
    'validation',
    'pricing'
  ];
  
  const updates = {};
  allowedUpdates.forEach(field => {
    if (updateData[field]) {
      updates[field] = updateData[field];
    }
  });
  
  // Update fields
  Object.assign(this, updates);
  this.lastUpdated = new Date();
  
  // Add to history
  this.history.push({
    action: 'modified',
    performedBy: updatedBy,
    performedByName: updatedByName,
    notes: 'Prescription updated',
    data: {
      updatedFields: Object.keys(updates),
      updateReason: updateData.reason || 'Prescription modification'
    }
  });
  
  return this.save().then(() => ({
    prescriptionID: this.prescriptionID,
    updatedFields: Object.keys(updates),
    lastUpdated: this.lastUpdated
  }));
};

prescriptionSchema.methods.sendToPharmacy = function(pharmacyId, pharmacistId, sentBy, sentByName) {
  if (this.status !== 'pending') {
    throw new Error('Only pending prescriptions can be sent to pharmacy');
  }
  
  this.status = 'sent_to_pharmacy';
  this.pharmacyInfo = {
    sentToPharmacy: true,
    pharmacyId: pharmacyId,
    pharmacistId: pharmacistId,
    sentDate: new Date(),
    ...this.pharmacyInfo
  };
  this.lastUpdated = new Date();
  
  // Add to history
  this.history.push({
    action: 'sent_to_pharmacy',
    performedBy: sentBy,
    performedByName: sentByName,
    notes: `Sent to pharmacy ${pharmacyId}`,
    data: {
      pharmacyId: pharmacyId,
      pharmacistId: pharmacistId
    }
  });
  
  return this.save();
};

prescriptionSchema.methods.dispenseMedication = function(pharmacistId, pharmacistName, dispensingData) {
  if (this.status !== 'sent_to_pharmacy') {
    throw new Error('Prescription must be sent to pharmacy before dispensing');
  }
  
  this.status = 'dispensed';
  this.pharmacyInfo.dispensedDate = new Date();
  this.pharmacyInfo.dispensingPharmacist = pharmacistName;
  this.lastUpdated = new Date();
  
  // Add to history
  this.history.push({
    action: 'dispensed',
    performedBy: pharmacistId,
    performedByName: pharmacistName,
    notes: 'Medication dispensed',
    data: dispensingData
  });
  
  return this.save();
};

prescriptionSchema.methods.completePrescription = function(completedBy, completedByName) {
  this.status = 'completed';
  this.lastUpdated = new Date();
  
  // Add to history
  this.history.push({
    action: 'completed',
    performedBy: completedBy,
    performedByName: completedByName,
    notes: 'Prescription completed',
    data: {}
  });
  
  return this.save();
};

prescriptionSchema.methods.cancelPrescription = function(cancelledBy, cancelledByName, reason = '') {
  this.status = 'cancelled';
  this.lastUpdated = new Date();
  
  // Add to history
  this.history.push({
    action: 'cancelled',
    performedBy: cancelledBy,
    performedByName: cancelledByName,
    notes: `Prescription cancelled: ${reason}`,
    data: { reason: reason }
  });
  
  return this.save();
};

prescriptionSchema.methods.addRefill = function(pharmacistId, pharmacistName, refillData) {
  if (this.status !== 'dispensed' && this.status !== 'completed') {
    throw new Error('Can only refill dispensed prescriptions');
  }
  
  // Update refill counts
  this.medicineList.forEach(medicine => {
    if (medicine.refillsUsed < medicine.refillsAllowed) {
      medicine.refillsUsed += 1;
    }
  });
  
  this.lastUpdated = new Date();
  
  // Add to history
  this.history.push({
    action: 'refilled',
    performedBy: pharmacistId,
    performedByName: pharmacistName,
    notes: 'Prescription refilled',
    data: refillData
  });
  
  return this.save();
};

prescriptionSchema.methods.validatePrescription = function(validatorId, validatorName, validationData) {
  this.validation = {
    ...this.validation,
    isValid: validationData.isValid,
    validationErrors: validationData.errors || [],
    validatedBy: validatorId,
    validationDate: new Date(),
    drugInteractions: validationData.drugInteractions || [],
    allergies: validationData.allergies || []
  };
  this.lastUpdated = new Date();
  
  // Add to history
  this.history.push({
    action: 'validated',
    performedBy: validatorId,
    performedByName: validatorName,
    notes: `Prescription ${validationData.isValid ? 'validated' : 'validation failed'}`,
    data: validationData
  });
  
  return this.save();
};

prescriptionSchema.methods.getPrescriptionHistory = function() {
  return this.history.sort((a, b) => b.timestamp - a.timestamp);
};

prescriptionSchema.methods.getPrescriptionSummary = function() {
  return {
    prescriptionID: this.prescriptionID,
    patientID: this.patientID,
    doctorId: this.doctorId,
    dateIssued: this.dateIssued,
    status: this.status,
    medicineCount: this.medicineList.length,
    totalCost: this.pricing.totalCost,
    isExpired: new Date() > this.expiryDate,
    daysUntilExpiry: Math.ceil((this.expiryDate - new Date()) / (1000 * 60 * 60 * 24)),
    lastAction: this.history.length > 0 ? this.history[this.history.length - 1].action : 'created'
  };
};

prescriptionSchema.methods.checkRefillEligibility = function() {
  const totalRefillsAllowed = this.medicineList.reduce((sum, med) => sum + med.refillsAllowed, 0);
  const totalRefillsUsed = this.medicineList.reduce((sum, med) => sum + med.refillsUsed, 0);
  
  return {
    eligible: totalRefillsUsed < totalRefillsAllowed,
    remainingRefills: totalRefillsAllowed - totalRefillsUsed,
    totalRefillsAllowed: totalRefillsAllowed,
    totalRefillsUsed: totalRefillsUsed,
    isExpired: new Date() > this.expiryDate
  };
};

// Static methods
prescriptionSchema.statics.findByPrescriptionID = function(prescriptionID) {
  return this.findOne({ prescriptionID });
};

prescriptionSchema.statics.findByPatientID = function(patientID) {
  return this.find({ patientID }).sort({ dateIssued: -1 });
};

prescriptionSchema.statics.findByDoctorID = function(doctorId) {
  return this.find({ doctorId }).sort({ dateIssued: -1 });
};

prescriptionSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ dateIssued: -1 });
};

prescriptionSchema.statics.findByPharmacy = function(pharmacyId) {
  return this.find({ 'pharmacyInfo.pharmacyId': pharmacyId }).sort({ dateIssued: -1 });
};

prescriptionSchema.statics.findPendingPrescriptions = function() {
  return this.find({ status: 'pending' }).sort({ dateIssued: 1 });
};

prescriptionSchema.statics.findSentToPharmacy = function() {
  return this.find({ status: 'sent_to_pharmacy' }).sort({ dateIssued: 1 });
};

prescriptionSchema.statics.findExpiredPrescriptions = function() {
  return this.find({
    expiryDate: { $lt: new Date() },
    status: { $nin: ['completed', 'cancelled'] }
  }).sort({ expiryDate: 1 });
};

prescriptionSchema.statics.getPrescriptionStatistics = function(filters = {}) {
  const matchQuery = {};
  
  if (filters.dateFrom || filters.dateTo) {
    matchQuery.dateIssued = {};
    if (filters.dateFrom) matchQuery.dateIssued.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) matchQuery.dateIssued.$lte = new Date(filters.dateTo);
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalPrescriptions: { $sum: 1 },
        pendingPrescriptions: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        sentToPharmacy: {
          $sum: { $cond: [{ $eq: ['$status', 'sent_to_pharmacy'] }, 1, 0] }
        },
        dispensedPrescriptions: {
          $sum: { $cond: [{ $eq: ['$status', 'dispensed'] }, 1, 0] }
        },
        completedPrescriptions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledPrescriptions: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        expiredPrescriptions: {
          $sum: { $cond: [{ $gt: ['$expiryDate', new Date()] }, 1, 0] }
        },
        averageMedicinesPerPrescription: {
          $avg: { $size: '$medicineList' }
        }
      }
    }
  ]);
};

// Pre-save middleware
prescriptionSchema.pre('save', function(next) {
  // Generate prescription ID if not provided
  if (!this.prescriptionID) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 6);
    this.prescriptionID = `PRES${timestamp.substring(6)}${random}`.toUpperCase();
  }
  
  // Set default expiry date (30 days from issue date)
  if (!this.expiryDate) {
    const expiryDate = new Date(this.dateIssued);
    expiryDate.setDate(expiryDate.getDate() + 30);
    this.expiryDate = expiryDate;
  }
  
  // Update last updated timestamp
  this.lastUpdated = new Date();
  
  // Calculate total cost if not provided
  if (!this.pricing.totalCost && this.medicineList.length > 0) {
    this.pricing.totalCost = 0; // Would be calculated based on medicine prices
  }
  
  next();
});

// Indexes for better query performance
prescriptionSchema.index({ prescriptionID: 1 });
prescriptionSchema.index({ patientID: 1 });
prescriptionSchema.index({ doctorId: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ 'pharmacyInfo.pharmacyId': 1 });
prescriptionSchema.index({ dateIssued: -1 });
prescriptionSchema.index({ expiryDate: 1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
