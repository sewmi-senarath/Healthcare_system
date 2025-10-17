import mongoose from 'mongoose';
import User from './User.js';
import employeeBaseSchema from './Employee.js';

/**
 * Nurse Model - Following Single Responsibility Principle
 * Responsible only for nurse-specific functionality
 * Inherits from Employee base class
 */
const nurseSchema = new mongoose.Schema({
  assignedWard: {
    type: String,
    required: true,
    enum: [
      'emergency', 'icu', 'ccu', 'pediatrics', 'maternity', 'surgery',
      'orthopedics', 'cardiology', 'neurology', 'oncology', 'psychiatry',
      'geriatrics', 'rehabilitation', 'outpatient', 'day_surgery'
    ]
  },
  shiftSchedule: {
    monday: { start: String, end: String, shift: String },
    tuesday: { start: String, end: String, shift: String },
    wednesday: { start: String, end: String, shift: String },
    thursday: { start: String, end: String, shift: String },
    friday: { start: String, end: String, shift: String },
    saturday: { start: String, end: String, shift: String },
    sunday: { start: String, end: String, shift: String }
  },
  nursingLicense: {
    licenseNumber: { type: String, required: true, unique: true },
    issueDate: Date,
    expiryDate: Date,
    state: String,
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended'],
      default: 'active'
    }
  },
  specializations: [{
    type: String,
    enum: [
      'critical_care', 'emergency', 'pediatric', 'maternity', 'surgical',
      'psychiatric', 'oncology', 'geriatric', 'cardiac', 'trauma',
      'rehabilitation', 'home_health', 'public_health'
    ]
  }],
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    credentialNumber: String
  }],
  assignedPatients: [{
    patientId: String,
    admissionDate: Date,
    dischargeDate: Date,
    careLevel: {
      type: String,
      enum: ['basic', 'intermediate', 'critical', 'observation'],
      default: 'basic'
    }
  }],
  maxPatientLoad: {
    type: Number,
    default: 6
  },
  currentPatientCount: {
    type: Number,
    default: 0
  },
  performanceMetrics: {
    patientSatisfactionScore: { type: Number, default: 0 },
    medicationErrors: { type: Number, default: 0 },
    documentationCompleteness: { type: Number, default: 0 },
    lastEvaluation: Date
  }
});

// Instance methods - Interface Segregation Principle
nurseSchema.methods.updatePatientInfo = function(patientId, patientData) {
  const updateRecord = {
    patientId: patientId,
    updatedBy: this.empID,
    updatedByNurse: this.name,
    ward: this.assignedWard,
    updateDate: new Date(),
    updateData: patientData,
    type: 'nursing_update'
  };
  
  // In a real application, this would call patient service
  return updateRecord;
};

nurseSchema.methods.manageInventory = function(inventoryData) {
  const inventoryRecord = {
    inventoryId: `INV${Date.now()}`,
    managedBy: this.empID,
    managedByNurse: this.name,
    ward: this.assignedWard,
    action: inventoryData.action, // 'check_in', 'check_out', 'restock', 'dispose'
    items: inventoryData.items,
    quantity: inventoryData.quantity,
    date: new Date(),
    notes: inventoryData.notes
  };
  
  return inventoryRecord;
};

nurseSchema.methods.administerMedication = function(medicationData) {
  const medicationRecord = {
    medicationId: `MED${Date.now()}`,
    patientId: medicationData.patientId,
    administeredBy: this.empID,
    administeredByNurse: this.name,
    ward: this.assignedWard,
    medication: medicationData.medication,
    dosage: medicationData.dosage,
    route: medicationData.route, // 'oral', 'iv', 'im', 'topical'
    timeAdministered: new Date(),
    notes: medicationData.notes,
    status: 'administered'
  };
  
  return medicationRecord;
};

nurseSchema.methods.updateVitalSigns = function(patientId, vitalSigns) {
  const vitalSignsRecord = {
    patientId: patientId,
    recordedBy: this.empID,
    recordedByNurse: this.name,
    ward: this.assignedWard,
    vitalSigns: {
      temperature: vitalSigns.temperature,
      bloodPressure: vitalSigns.bloodPressure,
      heartRate: vitalSigns.heartRate,
      respiratoryRate: vitalSigns.respiratoryRate,
      oxygenSaturation: vitalSigns.oxygenSaturation
    },
    recordedDate: new Date(),
    notes: vitalSigns.notes
  };
  
  return vitalSignsRecord;
};

nurseSchema.methods.assignPatient = function(patientId, careLevel) {
  if (this.currentPatientCount < this.maxPatientLoad) {
    const patientAssignment = {
      patientId: patientId,
      nurseId: this.empID,
      nurseName: this.name,
      ward: this.assignedWard,
      admissionDate: new Date(),
      careLevel: careLevel
    };
    
    this.assignedPatients.push(patientAssignment);
    this.currentPatientCount++;
    return this.save();
  }
  throw new Error('Maximum patient load reached');
};

nurseSchema.methods.dischargePatient = function(patientId) {
  const patientIndex = this.assignedPatients.findIndex(
    patient => patient.patientId === patientId && !patient.dischargeDate
  );
  
  if (patientIndex !== -1) {
    this.assignedPatients[patientIndex].dischargeDate = new Date();
    this.currentPatientCount--;
    return this.save();
  }
  throw new Error('Patient not found in assigned patients');
};

nurseSchema.methods.updateShiftSchedule = function(day, scheduleData) {
  if (this.shiftSchedule[day]) {
    this.shiftSchedule[day] = {
      start: scheduleData.start,
      end: scheduleData.end,
      shift: scheduleData.shift || 'day'
    };
  }
  return this.save();
};

nurseSchema.methods.addSpecialization = function(specialization) {
  if (!this.specializations.includes(specialization)) {
    this.specializations.push(specialization);
    return this.save();
  }
  return this;
};

nurseSchema.methods.addCertification = function(certification) {
  this.certifications.push(certification);
  return this.save();
};

nurseSchema.methods.canAcceptNewPatient = function() {
  return this.currentPatientCount < this.maxPatientLoad;
};

nurseSchema.methods.getNurseProfile = function() {
  return {
    empID: this.empID,
    name: this.name,
    email: this.email,
    assignedWard: this.assignedWard,
    nursingLicense: this.nursingLicense,
    specializations: this.specializations,
    certifications: this.certifications,
    currentPatientCount: this.currentPatientCount,
    maxPatientLoad: this.maxPatientLoad,
    performanceMetrics: this.performanceMetrics,
    shiftSchedule: this.shiftSchedule
  };
};

nurseSchema.methods.updatePerformanceMetrics = function(metrics) {
  this.performanceMetrics = {
    ...this.performanceMetrics,
    ...metrics,
    lastEvaluation: new Date()
  };
  return this.save();
};

// Static methods
nurseSchema.statics.findByWard = function(ward) {
  return this.find({ assignedWard: ward, status: 'active' });
};

nurseSchema.statics.findBySpecialization = function(specialization) {
  return this.find({ specializations: specialization, status: 'active' });
};

nurseSchema.statics.findAvailableNurses = function() {
  return this.find({
    status: 'active',
    currentPatientCount: { $lt: '$maxPatientLoad' }
  });
};

nurseSchema.statics.findByLicenseNumber = function(licenseNumber) {
  return this.findOne({ 'nursingLicense.licenseNumber': licenseNumber });
};

// Pre-save middleware
nurseSchema.pre('save', function(next) {
  // Generate license number if not provided
  if (!this.nursingLicense.licenseNumber) {
    const timestamp = Date.now().toString();
    this.nursingLicense.licenseNumber = `RN${timestamp.substring(6)}`;
  }
  next();
});

// Merge employee base schema with nurse schema
const mergedNurseSchema = new mongoose.Schema({
  ...employeeBaseSchema.obj,
  ...nurseSchema.obj
});

// Copy methods from employee base schema
Object.assign(mergedNurseSchema.methods, employeeBaseSchema.methods);
Object.assign(mergedNurseSchema.statics, employeeBaseSchema.statics);

// Add nurse-specific methods
Object.assign(mergedNurseSchema.methods, nurseSchema.methods);

// Create Nurse model using discriminator pattern on User
const Nurse = User.discriminator('nurse', mergedNurseSchema);

export default Nurse;
