import mongoose from 'mongoose';

/**
 * Employee Base Schema - Following Single Responsibility Principle
 * Base schema for all healthcare employees
 * This will be extended by specific employee types
 */
const employeeBaseSchema = new mongoose.Schema({
  empID: {
    type: String,
    required: true,
    unique: true
  },
  hireDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  department: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated', 'on_leave'],
    default: 'active'
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  contactInfo: {
    workPhone: String,
    workEmail: String,
    officeLocation: String
  },
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['valid', 'expired', 'pending_renewal'],
      default: 'valid'
    }
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  }
});

// Instance methods - Interface Segregation Principle
employeeBaseSchema.methods.getEmpID = function() {
  return this.empID;
};

employeeBaseSchema.methods.updateEmployeeInfo = function(updateData) {
  const allowedUpdates = [
    'contactInfo', 
    'emergencyContact', 
    'certifications',
    'position',
    'department'
  ];
  
  const updates = {};
  allowedUpdates.forEach(field => {
    if (updateData[field]) {
      updates[field] = updateData[field];
    }
  });
  
  Object.assign(this, updates);
  return this.save();
};

employeeBaseSchema.methods.viewEmployeeProfile = function() {
  return {
    empID: this.empID,
    name: this.name,
    email: this.email,
    position: this.position,
    department: this.department,
    hireDate: this.hireDate,
    status: this.status,
    certifications: this.certifications,
    contactInfo: this.contactInfo
  };
};

employeeBaseSchema.methods.updateCertification = function(certificationData) {
  const certIndex = this.certifications.findIndex(
    cert => cert.name === certificationData.name
  );
  
  if (certIndex !== -1) {
    this.certifications[certIndex] = { ...this.certifications[certIndex], ...certificationData };
  } else {
    this.certifications.push(certificationData);
  }
  
  return this.save();
};

employeeBaseSchema.methods.viewSchedule = function(startDate, endDate) {
  // This would typically fetch from a scheduling service
  return {
    empID: this.empID,
    name: this.name,
    schedule: [],
    startDate: startDate,
    endDate: endDate
  };
};

employeeBaseSchema.methods.requestTimeOff = function(timeOffData) {
  // This would typically interact with HR service
  return {
    empID: this.empID,
    requestType: timeOffData.type,
    startDate: timeOffData.startDate,
    endDate: timeOffData.endDate,
    reason: timeOffData.reason,
    status: 'pending',
    submittedDate: new Date()
  };
};

employeeBaseSchema.methods.viewPayroll = function(period) {
  // This would typically fetch from payroll service
  return {
    empID: this.empID,
    name: this.name,
    period: period,
    salary: this.salary,
    deductions: [],
    netPay: 0
  };
};

employeeBaseSchema.methods.updateStatus = function(newStatus, reason = '') {
  const statusChange = {
    previousStatus: this.status,
    newStatus: newStatus,
    reason: reason,
    changedDate: new Date(),
    changedBy: this._id
  };
  
  this.status = newStatus;
  return this.save();
};

// Static methods
employeeBaseSchema.statics.findByEmpID = function(empID) {
  return this.findOne({ empID });
};

employeeBaseSchema.statics.findByDepartment = function(department) {
  return this.find({ department, status: 'active' });
};

employeeBaseSchema.statics.findByPosition = function(position) {
  return this.find({ position, status: 'active' });
};

employeeBaseSchema.statics.findActiveEmployees = function() {
  return this.find({ status: 'active' });
};

// Pre-save middleware to generate employee ID if not provided
employeeBaseSchema.pre('save', function(next) {
  if (!this.empID) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 6);
    const prefix = this.position.charAt(0).toUpperCase();
    this.empID = `${prefix}${timestamp.substring(6)}${random}`.toUpperCase();
  }
  next();
});

// Export the base schema for extension by specific employee types
export default employeeBaseSchema;
