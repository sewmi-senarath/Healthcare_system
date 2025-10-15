import mongoose from 'mongoose';
import User from './User.js';

/**
 * SystemAdmin Model - Following Single Responsibility Principle
 * Responsible only for system administration functionality
 * Inherits from User base class
 */
const systemAdminSchema = new mongoose.Schema({
  privileges: [{
    type: String,
    enum: [
      'user_management',
      'hospital_management',
      'system_configuration',
      'data_export',
      'audit_logs',
      'backup_restore',
      'security_settings',
      'role_management'
    ]
  }],
  adminLevel: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  lastAccessDate: {
    type: Date,
    default: Date.now
  },
  accessLogs: [{
    action: String,
    timestamp: Date,
    ipAddress: String,
    userAgent: String
  }]
});

// Instance methods - Interface Segregation Principle
systemAdminSchema.methods.manageUsers = function(userId, action, updateData) {
  const logEntry = {
    action: `user_${action}`,
    timestamp: new Date(),
    targetUserId: userId
  };
  
  this.accessLogs.push(logEntry);
  
  // In a real application, this would interact with user management service
  const userAction = {
    adminId: this._id,
    targetUserId: userId,
    action: action,
    updateData: updateData,
    timestamp: new Date(),
    status: 'pending'
  };
  
  return userAction;
};

systemAdminSchema.methods.addHospital = function(hospitalData) {
  const logEntry = {
    action: 'add_hospital',
    timestamp: new Date(),
    hospitalName: hospitalData.name
  };
  
  this.accessLogs.push(logEntry);
  
  // In a real application, this would interact with hospital management service
  const hospital = {
    name: hospitalData.name,
    address: hospitalData.address,
    contactInfo: hospitalData.contactInfo,
    createdBy: this._id,
    createdDate: new Date(),
    status: 'active'
  };
  
  return hospital;
};

systemAdminSchema.methods.removeHospital = function(hospitalId) {
  const logEntry = {
    action: 'remove_hospital',
    timestamp: new Date(),
    hospitalId: hospitalId
  };
  
  this.accessLogs.push(logEntry);
  
  // In a real application, this would interact with hospital management service
  return {
    hospitalId: hospitalId,
    action: 'remove',
    adminId: this._id,
    timestamp: new Date()
  };
};

systemAdminSchema.methods.updateHospital = function(hospitalId, updateData) {
  const logEntry = {
    action: 'update_hospital',
    timestamp: new Date(),
    hospitalId: hospitalId
  };
  
  this.accessLogs.push(logEntry);
  
  return {
    hospitalId: hospitalId,
    action: 'update',
    updateData: updateData,
    adminId: this._id,
    timestamp: new Date()
  };
};

systemAdminSchema.methods.viewSystemLogs = function(filters = {}) {
  const logEntry = {
    action: 'view_system_logs',
    timestamp: new Date(),
    filters: filters
  };
  
  this.accessLogs.push(logEntry);
  
  // In a real application, this would fetch from logging service
  return {
    logs: [],
    filters: filters,
    adminId: this._id,
    timestamp: new Date()
  };
};

systemAdminSchema.methods.manageSystemSettings = function(settingsData) {
  const logEntry = {
    action: 'update_system_settings',
    timestamp: new Date(),
    settingsUpdated: Object.keys(settingsData)
  };
  
  this.accessLogs.push(logEntry);
  
  return {
    settings: settingsData,
    adminId: this._id,
    timestamp: new Date(),
    status: 'updated'
  };
};

systemAdminSchema.methods.hasPrivilege = function(privilege) {
  return this.privileges.includes(privilege);
};

systemAdminSchema.methods.addPrivilege = function(privilege) {
  if (!this.privileges.includes(privilege)) {
    this.privileges.push(privilege);
    return this.save();
  }
  return this;
};

systemAdminSchema.methods.removePrivilege = function(privilege) {
  this.privileges = this.privileges.filter(p => p !== privilege);
  return this.save();
};

// Static methods
systemAdminSchema.statics.findByAdminLevel = function(level) {
  return this.find({ adminLevel: level });
};

systemAdminSchema.statics.findByPrivilege = function(privilege) {
  return this.find({ privileges: privilege });
};

// Pre-save middleware
systemAdminSchema.pre('save', function(next) {
  this.lastAccessDate = new Date();
  next();
});

// Create SystemAdmin model using discriminator pattern
const SystemAdmin = User.discriminator('systemAdmin', systemAdminSchema);

export default SystemAdmin;
