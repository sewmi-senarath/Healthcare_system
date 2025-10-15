import mongoose from 'mongoose';
import User from './User.js';
import employeeBaseSchema from './Employee.js';

/**
 * HospitalStaff Model - Following Single Responsibility Principle
 * Responsible only for hospital staff functionality
 * Inherits from Employee base class
 */
const hospitalStaffSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: [
      'receptionist', 'administrator', 'coordinator', 'clerk',
      'technician', 'maintenance', 'security', 'janitorial',
      'food_service', 'transportation', 'billing_specialist'
    ]
  },
  assignedDepartment: {
    type: String,
    required: true,
    enum: [
      'emergency', 'cardiology', 'neurology', 'oncology', 'pediatrics',
      'surgery', 'orthopedics', 'dermatology', 'psychiatry', 'radiology',
      'laboratory', 'pharmacy', 'administration', 'billing', 'maintenance',
      'food_service', 'transportation', 'security', 'housekeeping'
    ]
  },
  shiftSchedule: {
    monday: { start: String, end: String, type: String },
    tuesday: { start: String, end: String, type: String },
    wednesday: { start: String, end: String, type: String },
    thursday: { start: String, end: String, type: String },
    friday: { start: String, end: String, type: String },
    saturday: { start: String, end: String, type: String },
    sunday: { start: String, end: String, type: String }
  },
  workLocation: {
    building: String,
    floor: String,
    room: String,
    deskNumber: String
  },
  accessLevel: {
    type: String,
    enum: ['basic', 'intermediate', 'advanced', 'administrative'],
    default: 'basic'
  },
  permissions: [{
    type: String,
    enum: [
      'patient_data_read', 'patient_data_write', 'billing_access',
      'appointment_management', 'inventory_management', 'report_generation',
      'system_configuration', 'user_management'
    ]
  }],
  performanceMetrics: {
    tasksCompleted: { type: Number, default: 0 },
    efficiency: { type: Number, default: 0 },
    lastEvaluation: Date,
    supervisorNotes: String
  }
});

// Instance methods - Interface Segregation Principle
hospitalStaffSchema.methods.scanHealthCard = function(healthCardData) {
  // This would typically interact with health card scanning service
  const scanResult = {
    scannedBy: this.empID,
    scannedByName: this.name,
    scanDate: new Date(),
    healthCardID: healthCardData.cardId,
    patientInfo: {
      // Would be populated from health card data
      patientId: healthCardData.patientId,
      name: healthCardData.patientName,
      insurance: healthCardData.insuranceInfo
    },
    status: 'verified'
  };
  
  return scanResult;
};

hospitalStaffSchema.methods.updatePatientInfo = function(patientId, updateData) {
  // This would typically interact with patient service
  const updateRecord = {
    patientId: patientId,
    updatedBy: this.empID,
    updatedByName: this.name,
    updateDate: new Date(),
    updateData: updateData,
    department: this.assignedDepartment,
    role: this.role
  };
  
  return updateRecord;
};

hospitalStaffSchema.methods.manageAppointments = function(action, appointmentData) {
  const appointmentAction = {
    action: action,
    appointmentId: appointmentData.appointmentId,
    handledBy: this.empID,
    handledByName: this.name,
    department: this.assignedDepartment,
    timestamp: new Date(),
    data: appointmentData
  };
  
  return appointmentAction;
};

hospitalStaffSchema.methods.processBilling = function(billingData) {
  // This would typically interact with billing service
  const billingRecord = {
    billingId: `BILL${Date.now()}`,
    processedBy: this.empID,
    processedByName: this.name,
    patientId: billingData.patientId,
    amount: billingData.amount,
    services: billingData.services,
    processedDate: new Date(),
    status: 'pending'
  };
  
  return billingRecord;
};

hospitalStaffSchema.methods.generateReport = function(reportType, filters = {}) {
  const report = {
    reportId: `RPT${Date.now()}`,
    reportType: reportType,
    generatedBy: this.empID,
    generatedByName: this.name,
    department: this.assignedDepartment,
    generatedDate: new Date(),
    filters: filters,
    status: 'generated'
  };
  
  return report;
};

hospitalStaffSchema.methods.updateShiftSchedule = function(day, scheduleData) {
  if (this.shiftSchedule[day]) {
    this.shiftSchedule[day] = {
      start: scheduleData.start,
      end: scheduleData.end,
      type: scheduleData.type || 'regular'
    };
  }
  return this.save();
};

hospitalStaffSchema.methods.checkPermissions = function(permission) {
  return this.permissions.includes(permission);
};

hospitalStaffSchema.methods.addPermission = function(permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
    return this.save();
  }
  return this;
};

hospitalStaffSchema.methods.removePermission = function(permission) {
  this.permissions = this.permissions.filter(p => p !== permission);
  return this.save();
};

hospitalStaffSchema.methods.updatePerformanceMetrics = function(metrics) {
  this.performanceMetrics = {
    ...this.performanceMetrics,
    ...metrics,
    lastEvaluation: new Date()
  };
  return this.save();
};

hospitalStaffSchema.methods.getStaffProfile = function() {
  return {
    empID: this.empID,
    name: this.name,
    email: this.email,
    role: this.role,
    assignedDepartment: this.assignedDepartment,
    accessLevel: this.accessLevel,
    permissions: this.permissions,
    workLocation: this.workLocation,
    performanceMetrics: this.performanceMetrics,
    shiftSchedule: this.shiftSchedule
  };
};

// Static methods
hospitalStaffSchema.statics.findByRole = function(role) {
  return this.find({ role, status: 'active' });
};

hospitalStaffSchema.statics.findByDepartment = function(department) {
  return this.find({ assignedDepartment: department, status: 'active' });
};

hospitalStaffSchema.statics.findByAccessLevel = function(accessLevel) {
  return this.find({ accessLevel, status: 'active' });
};

hospitalStaffSchema.statics.findStaffWithPermission = function(permission) {
  return this.find({ permissions: permission, status: 'active' });
};

// Pre-save middleware
hospitalStaffSchema.pre('save', function(next) {
  // Set default permissions based on role
  if (this.isNew && this.permissions.length === 0) {
    const defaultPermissions = {
      'receptionist': ['patient_data_read', 'appointment_management'],
      'administrator': ['patient_data_read', 'patient_data_write', 'billing_access', 'report_generation'],
      'coordinator': ['patient_data_read', 'appointment_management', 'inventory_management'],
      'billing_specialist': ['billing_access', 'report_generation'],
      'technician': ['patient_data_read'],
      'maintenance': [],
      'security': [],
      'janitorial': [],
      'food_service': [],
      'transportation': []
    };
    
    this.permissions = defaultPermissions[this.role] || [];
  }
  next();
});

// Merge employee base schema with hospital staff schema
const mergedHospitalStaffSchema = new mongoose.Schema({
  ...employeeBaseSchema.obj,
  ...hospitalStaffSchema.obj
});

// Copy methods from employee base schema
Object.assign(mergedHospitalStaffSchema.methods, employeeBaseSchema.methods);
Object.assign(mergedHospitalStaffSchema.statics, employeeBaseSchema.statics);

// Add hospital staff-specific methods
Object.assign(mergedHospitalStaffSchema.methods, hospitalStaffSchema.methods);

// Create HospitalStaff model using discriminator pattern on User
const HospitalStaff = User.discriminator('hospitalStaff', mergedHospitalStaffSchema);

export default HospitalStaff;
