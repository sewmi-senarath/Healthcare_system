import mongoose from 'mongoose';
import User from './User.js';
import employeeBaseSchema from './Employee.js';

/**
 * HealthCareManager Model - Following Single Responsibility Principle
 * Responsible only for healthcare management functionality
 * Inherits from Employee base class
 */
const healthCareManagerSchema = new mongoose.Schema({
  assignedHospital: {
    hospitalId: { type: String, required: true },
    hospitalName: String,
    address: String,
    type: {
      type: String,
      enum: ['general', 'specialty', 'teaching', 'research'],
      default: 'general'
    }
  },
  managementLevel: {
    type: String,
    enum: ['department', 'division', 'hospital', 'regional'],
    default: 'department'
  },
  departmentsManaged: [{
    departmentId: String,
    departmentName: String,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'inactive', 'transferred'],
      default: 'active'
    }
  }],
  managementCertifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    credentialNumber: String
  }],
  budgetResponsibilities: {
    annualBudget: Number,
    currentSpent: { type: Number, default: 0 },
    budgetCategories: [{
      category: String,
      allocated: Number,
      spent: { type: Number, default: 0 }
    }]
  },
  staffManagement: {
    totalStaffManaged: { type: Number, default: 0 },
    directReports: [{
      employeeId: String,
      employeeName: String,
      position: String,
      startDate: Date
    }],
    maxDirectReports: { type: Number, default: 20 }
  },
  performanceMetrics: {
    patientSatisfaction: { type: Number, default: 0 },
    staffSatisfaction: { type: Number, default: 0 },
    operationalEfficiency: { type: Number, default: 0 },
    budgetUtilization: { type: Number, default: 0 },
    lastReviewDate: Date
  },
  reportingSchedule: {
    dailyReports: Boolean,
    weeklyReports: Boolean,
    monthlyReports: Boolean,
    quarterlyReports: Boolean
  }
});

// Instance methods - Interface Segregation Principle
healthCareManagerSchema.methods.viewReports = function(reportType, filters = {}) {
  const report = {
    reportId: `RPT${Date.now()}`,
    reportType: reportType,
    requestedBy: this.empID,
    requestedByManager: this.name,
    hospitalId: this.assignedHospital.hospitalId,
    generatedDate: new Date(),
    filters: filters,
    data: {
      // In a real application, this would fetch actual data
      patientMetrics: {},
      financialMetrics: {},
      operationalMetrics: {},
      staffMetrics: {}
    },
    status: 'generated'
  };
  
  return report;
};

healthCareManagerSchema.methods.manageStaff = function(staffAction, staffData) {
  const staffManagementRecord = {
    actionId: `STAFF${Date.now()}`,
    action: staffAction, // 'hire', 'terminate', 'transfer', 'promote', 'evaluate'
    managedBy: this.empID,
    managedByManager: this.name,
    hospitalId: this.assignedHospital.hospitalId,
    targetEmployee: staffData.employeeId,
    actionDate: new Date(),
    details: staffData.details,
    status: 'pending'
  };
  
  // Update direct reports if hiring
  if (staffAction === 'hire' && this.staffManagement.directReports.length < this.staffManagement.maxDirectReports) {
    this.staffManagement.directReports.push({
      employeeId: staffData.employeeId,
      employeeName: staffData.employeeName,
      position: staffData.position,
      startDate: new Date()
    });
    this.staffManagement.totalStaffManaged++;
  }
  
  return staffManagementRecord;
};

healthCareManagerSchema.methods.analyzeServiceUtilization = function(analysisFilters = {}) {
  const analysis = {
    analysisId: `ANALYSIS${Date.now()}`,
    analyzedBy: this.empID,
    analyzedByManager: this.name,
    hospitalId: this.assignedHospital.hospitalId,
    analysisDate: new Date(),
    filters: analysisFilters,
    utilizationMetrics: {
      bedOccupancy: 0,
      equipmentUtilization: 0,
      staffUtilization: 0,
      serviceDemand: {},
      peakHours: {},
      bottlenecks: []
    },
    recommendations: [],
    status: 'completed'
  };
  
  return analysis;
};

healthCareManagerSchema.methods.manageBudget = function(budgetAction, budgetData) {
  const budgetRecord = {
    budgetId: `BUDGET${Date.now()}`,
    action: budgetAction, // 'allocate', 'transfer', 'approve', 'deny'
    managedBy: this.empID,
    managedByManager: this.name,
    hospitalId: this.assignedHospital.hospitalId,
    actionDate: new Date(),
    amount: budgetData.amount,
    category: budgetData.category,
    justification: budgetData.justification,
    status: 'pending'
  };
  
  return budgetRecord;
};

healthCareManagerSchema.methods.schedulePerformanceReview = function(reviewData) {
  const review = {
    reviewId: `REVIEW${Date.now()}`,
    scheduledBy: this.empID,
    scheduledByManager: this.name,
    targetEmployee: reviewData.employeeId,
    reviewType: reviewData.reviewType, // 'annual', 'quarterly', 'probationary'
    scheduledDate: reviewData.scheduledDate,
    objectives: reviewData.objectives,
    criteria: reviewData.criteria,
    status: 'scheduled'
  };
  
  return review;
};

healthCareManagerSchema.methods.implementPolicy = function(policyData) {
  const policy = {
    policyId: `POLICY${Date.now()}`,
    implementedBy: this.empID,
    implementedByManager: this.name,
    hospitalId: this.assignedHospital.hospitalId,
    policyName: policyData.policyName,
    policyType: policyData.policyType,
    implementationDate: new Date(),
    effectiveDate: policyData.effectiveDate,
    departments: policyData.departments,
    status: 'active'
  };
  
  return policy;
};

healthCareManagerSchema.methods.manageQualityAssurance = function(qaData) {
  const qaRecord = {
    qaId: `QA${Date.now()}`,
    managedBy: this.empID,
    managedByManager: this.name,
    hospitalId: this.assignedHospital.hospitalId,
    qaType: qaData.qaType, // 'audit', 'inspection', 'review'
    target: qaData.target, // 'department', 'process', 'equipment'
    scheduledDate: qaData.scheduledDate,
    criteria: qaData.criteria,
    status: 'scheduled'
  };
  
  return qaRecord;
};

// Support Ticket Management Methods
healthCareManagerSchema.methods.manageSupportTicket = async function(ticketID, action, data = {}) {
  // Import SupportTicket model dynamically to avoid circular dependency
  const SupportTicket = (await import('./SupportTicket.js')).default;
  
  const ticket = await SupportTicket.findOne({ ticketID });
  
  if (!ticket) {
    throw new Error('Support ticket not found');
  }
  
  let result;
  
  switch (action) {
    case 'assign':
      result = await ticket.assignStaff(data.staffID, this.empID, data.notes);
      break;
    case 'update_status':
      result = await ticket.updateStatus(data.status, this.empID, data.notes);
      break;
    case 'close':
      result = await ticket.closeTicket(this.empID, data.resolution);
      break;
    case 'escalate':
      result = await ticket.escalateTicket(this.empID, data.reason);
      break;
    case 'update_priority':
      result = await ticket.updatePriority(data.priority, this.empID, data.reason);
      break;
    case 'add_communication':
      result = await ticket.addCommunication(data.message, this.empID, 'staff', data.isInternal);
      break;
    default:
      throw new Error('Invalid ticket action');
  }
  
  return result;
};

healthCareManagerSchema.methods.viewSupportTickets = async function(filters = {}) {
  // Import SupportTicket model dynamically to avoid circular dependency
  const SupportTicket = (await import('./SupportTicket.js')).default;
  
  let query = {};
  
  // Apply filters
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.category) query.category = filters.category;
  if (filters.assignedStaffID) query.assignedStaffID = filters.assignedStaffID;
  if (filters.dateFrom) query.dateCreated = { $gte: new Date(filters.dateFrom) };
  if (filters.dateTo) query.dateCreated = { ...query.dateCreated, $lte: new Date(filters.dateTo) };
  
  const tickets = await SupportTicket.find(query).sort({ dateCreated: -1 });
  return tickets.map(ticket => ticket.getTicketDetails());
};

healthCareManagerSchema.methods.assignTicketToStaff = async function(ticketID, staffID, notes = '') {
  return await this.manageSupportTicket(ticketID, 'assign', {
    staffID: staffID,
    notes: notes
  });
};

healthCareManagerSchema.methods.updateTicketStatus = async function(ticketID, status, notes = '') {
  return await this.manageSupportTicket(ticketID, 'update_status', {
    status: status,
    notes: notes
  });
};

healthCareManagerSchema.methods.closeSupportTicket = async function(ticketID, resolution = {}) {
  return await this.manageSupportTicket(ticketID, 'close', {
    resolution: resolution
  });
};

healthCareManagerSchema.methods.escalateSupportTicket = async function(ticketID, reason = '') {
  return await this.manageSupportTicket(ticketID, 'escalate', {
    reason: reason
  });
};

healthCareManagerSchema.methods.addTicketCommunication = async function(ticketID, message, isInternal = false) {
  return await this.manageSupportTicket(ticketID, 'add_communication', {
    message: message,
    isInternal: isInternal
  });
};

healthCareManagerSchema.methods.getTicketStatistics = async function(filters = {}) {
  // Import SupportTicket model dynamically to avoid circular dependency
  const SupportTicket = (await import('./SupportTicket.js')).default;
  
  let matchQuery = {};
  
  // Apply date filters
  if (filters.dateFrom || filters.dateTo) {
    matchQuery.dateCreated = {};
    if (filters.dateFrom) matchQuery.dateCreated.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) matchQuery.dateCreated.$lte = new Date(filters.dateTo);
  }
  
  const stats = await SupportTicket.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalTickets: { $sum: 1 },
        openTickets: {
          $sum: {
            $cond: [{ $in: ['$status', ['open', 'in_progress', 'assigned']] }, 1, 0]
          }
        },
        closedTickets: {
          $sum: {
            $cond: [{ $eq: ['$status', 'closed'] }, 1, 0]
          }
        },
        averageResolutionTime: {
          $avg: {
            $cond: [
              { $ne: ['$actualResolutionTime', null] },
              {
                $divide: [
                  { $subtract: ['$actualResolutionTime', '$dateCreated'] },
                  1000 * 60 * 60 // Convert to hours
                ]
              },
              null
            ]
          }
        },
        averageSatisfactionRating: {
          $avg: {
            $cond: [
              { $ne: ['$patientSatisfactionRating', null] },
              '$patientSatisfactionRating',
              null
            ]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    averageResolutionTime: 0,
    averageSatisfactionRating: 0
  };
};

healthCareManagerSchema.methods.addDepartment = function(departmentData) {
  const department = {
    departmentId: departmentData.departmentId,
    departmentName: departmentData.departmentName,
    startDate: new Date(),
    status: 'active'
  };
  
  this.departmentsManaged.push(department);
  return this.save();
};

healthCareManagerSchema.methods.removeDepartment = function(departmentId) {
  const departmentIndex = this.departmentsManaged.findIndex(
    dept => dept.departmentId === departmentId && dept.status === 'active'
  );
  
  if (departmentIndex !== -1) {
    this.departmentsManaged[departmentIndex].endDate = new Date();
    this.departmentsManaged[departmentIndex].status = 'inactive';
    return this.save();
  }
  throw new Error('Department not found');
};

healthCareManagerSchema.methods.updatePerformanceMetrics = function(metrics) {
  this.performanceMetrics = {
    ...this.performanceMetrics,
    ...metrics,
    lastReviewDate: new Date()
  };
  return this.save();
};

healthCareManagerSchema.methods.getManagerProfile = function() {
  return {
    empID: this.empID,
    name: this.name,
    email: this.email,
    assignedHospital: this.assignedHospital,
    managementLevel: this.managementLevel,
    departmentsManaged: this.departmentsManaged,
    managementCertifications: this.managementCertifications,
    budgetResponsibilities: this.budgetResponsibilities,
    staffManagement: this.staffManagement,
    performanceMetrics: this.performanceMetrics,
    reportingSchedule: this.reportingSchedule
  };
};

// Appointment Approval Management Methods
healthCareManagerSchema.methods.viewPendingAppointments = async function() {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  const appointments = await Appointment.findPendingApproval();
  return appointments.map(appointment => appointment.getAppointmentSummary());
};

healthCareManagerSchema.methods.approveAppointment = async function(appointmentID, approvalNotes = '') {
  // Import Appointment and Notification models dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  const Notification = (await import('./Notification.js')).default;
  
  const appointment = await Appointment.findByAppointmentID(appointmentID);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  if (appointment.status !== 'pending_approval') {
    throw new Error('Only pending appointments can be approved');
  }
  
  // Approve appointment
  await appointment.approveAppointment(this.empID, this.name, approvalNotes);
  
  // Send notification to patient
  const patientNotification = new Notification({
    recipientId: appointment.patientID,
    recipientType: 'patient',
    message: `Your appointment has been approved and is scheduled for ${appointment.dateTime.toLocaleDateString()} at ${appointment.dateTime.toLocaleTimeString()}`,
    type: 'appointment_approved',
    priority: 'medium',
    dataSent: {
      appointmentID: appointment.appointmentID,
      doctorID: appointment.doctorID,
      dateTime: appointment.dateTime,
      approvalNotes: approvalNotes
    },
    metadata: {
      senderId: this.empID,
      senderType: 'healthCareManager',
      relatedEntityId: appointment.appointmentID,
      relatedEntityType: 'appointment',
      category: 'medical'
    }
  });
  
  await patientNotification.save();
  await patientNotification.sendNotification(this.empID, 'healthCareManager', ['in_app', 'email']);
  
  // Send notification to doctor
  const doctorNotification = new Notification({
    recipientId: appointment.doctorID,
    recipientType: 'doctor',
    message: `New appointment approved for ${appointment.dateTime.toLocaleDateString()} at ${appointment.dateTime.toLocaleTimeString()}`,
    type: 'appointment_approved',
    priority: 'medium',
    dataSent: {
      appointmentID: appointment.appointmentID,
      patientID: appointment.patientID,
      dateTime: appointment.dateTime,
      reasonForVisit: appointment.reasonForVisit
    },
    metadata: {
      senderId: this.empID,
      senderType: 'healthCareManager',
      relatedEntityId: appointment.appointmentID,
      relatedEntityType: 'appointment',
      category: 'medical'
    }
  });
  
  await doctorNotification.save();
  await doctorNotification.sendNotification(this.empID, 'healthCareManager', ['in_app', 'email']);
  
  return {
    appointmentID: appointment.appointmentID,
    approved: true,
    status: appointment.status,
    approvalDate: appointment.approvalWorkflow.reviewedDate,
    notificationsSent: ['patient', 'doctor']
  };
};

healthCareManagerSchema.methods.declineAppointment = async function(appointmentID, declineReason) {
  // Import Appointment and Notification models dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  const Notification = (await import('./Notification.js')).default;
  
  const appointment = await Appointment.findByAppointmentID(appointmentID);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  if (appointment.status !== 'pending_approval') {
    throw new Error('Only pending appointments can be declined');
  }
  
  if (!declineReason || declineReason.trim() === '') {
    throw new Error('Decline reason is required when declining an appointment');
  }
  
  // Decline appointment
  await appointment.declineAppointment(this.empID, this.name, declineReason);
  
  // Send notification to patient
  const patientNotification = new Notification({
    recipientId: appointment.patientID,
    recipientType: 'patient',
    message: `Your appointment request has been declined. Reason: ${declineReason}. Please contact us to reschedule.`,
    type: 'appointment_declined',
    priority: 'high',
    dataSent: {
      appointmentID: appointment.appointmentID,
      doctorID: appointment.doctorID,
      requestedDateTime: appointment.dateTime,
      declineReason: declineReason,
      contactInfo: 'Please contact our support team for assistance'
    },
    metadata: {
      senderId: this.empID,
      senderType: 'healthCareManager',
      relatedEntityId: appointment.appointmentID,
      relatedEntityType: 'appointment',
      category: 'medical'
    }
  });
  
  await patientNotification.save();
  await patientNotification.sendNotification(this.empID, 'healthCareManager', ['in_app', 'email', 'sms']);
  
  // Send notification to doctor
  const doctorNotification = new Notification({
    recipientId: appointment.doctorID,
    recipientType: 'doctor',
    message: `Appointment request declined for ${appointment.dateTime.toLocaleDateString()}. Reason: ${declineReason}`,
    type: 'appointment_declined',
    priority: 'medium',
    dataSent: {
      appointmentID: appointment.appointmentID,
      patientID: appointment.patientID,
      requestedDateTime: appointment.dateTime,
      declineReason: declineReason
    },
    metadata: {
      senderId: this.empID,
      senderType: 'healthCareManager',
      relatedEntityId: appointment.appointmentID,
      relatedEntityType: 'appointment',
      category: 'medical'
    }
  });
  
  await doctorNotification.save();
  await doctorNotification.sendNotification(this.empID, 'healthCareManager', ['in_app', 'email']);
  
  return {
    appointmentID: appointment.appointmentID,
    declined: true,
    status: appointment.status,
    declineDate: appointment.approvalWorkflow.reviewedDate,
    declineReason: declineReason,
    notificationsSent: ['patient', 'doctor']
  };
};

healthCareManagerSchema.methods.viewAppointment = async function(appointmentID) {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  const appointment = await Appointment.findByAppointmentID(appointmentID);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  return appointment.getAppointmentSummary();
};

healthCareManagerSchema.methods.viewAppointmentHistory = async function(appointmentID) {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  const appointment = await Appointment.findByAppointmentID(appointmentID);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  return appointment.getAppointmentHistory();
};

healthCareManagerSchema.methods.viewApprovedAppointments = async function() {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  const appointments = await Appointment.findApprovedAppointments();
  return appointments.map(appointment => appointment.getAppointmentSummary());
};

healthCareManagerSchema.methods.viewDeclinedAppointments = async function() {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  const appointments = await Appointment.findDeclinedAppointments();
  return appointments.map(appointment => appointment.getAppointmentSummary());
};

healthCareManagerSchema.methods.bulkApproveAppointments = async function(appointmentIDs, approvalNotes = '') {
  // Import Appointment and Notification models dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  const Notification = (await import('./Notification.js')).default;
  
  const results = [];
  
  for (const appointmentID of appointmentIDs) {
    try {
      const appointment = await Appointment.findByAppointmentID(appointmentID);
      
      if (!appointment) {
        results.push({ appointmentID, status: 'error', message: 'Appointment not found' });
        continue;
      }
      
      if (appointment.status !== 'pending_approval') {
        results.push({ appointmentID, status: 'skipped', message: 'Appointment is not pending approval' });
        continue;
      }
      
      // Approve appointment
      await appointment.approveAppointment(this.empID, this.name, approvalNotes);
      
      // Send notifications
      const patientNotification = new Notification({
        recipientId: appointment.patientID,
        recipientType: 'patient',
        message: `Your appointment has been approved and is scheduled for ${appointment.dateTime.toLocaleDateString()}`,
        type: 'appointment_approved',
        priority: 'medium',
        dataSent: {
          appointmentID: appointment.appointmentID,
          doctorID: appointment.doctorID,
          dateTime: appointment.dateTime
        },
        metadata: {
          senderId: this.empID,
          senderType: 'healthCareManager',
          relatedEntityId: appointment.appointmentID,
          relatedEntityType: 'appointment',
          category: 'medical'
        }
      });
      
      await patientNotification.save();
      await patientNotification.sendNotification(this.empID, 'healthCareManager', ['in_app', 'email']);
      
      results.push({ appointmentID, status: 'approved', message: 'Appointment approved successfully' });
    } catch (error) {
      results.push({ appointmentID, status: 'error', message: error.message });
    }
  }
  
  return results;
};

healthCareManagerSchema.methods.getAppointmentApprovalStatistics = async function(filters = {}) {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  const stats = await Appointment.getAppointmentStatistics({
    ...filters,
    'approvalWorkflow.reviewedBy': this.empID
  });
  
  return stats[0] || {
    totalAppointments: 0,
    pendingApproval: 0,
    approvedAppointments: 0,
    declinedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    noShowAppointments: 0
  };
};

healthCareManagerSchema.methods.viewAppointmentsByDateRange = async function(startDate, endDate) {
  // Import Appointment model dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  
  const appointments = await Appointment.findByDateRange(startDate, endDate);
  return appointments.map(appointment => appointment.getAppointmentSummary());
};

healthCareManagerSchema.methods.overrideAppointmentApproval = async function(appointmentID, action, reason, overrideData = {}) {
  // Import Appointment and Notification models dynamically to avoid circular dependency
  const Appointment = (await import('./Appointment.js')).default;
  const Notification = (await import('./Notification.js')).default;
  
  const appointment = await Appointment.findByAppointmentID(appointmentID);
  
  if (!appointment) {
    throw new Error('Appointment not found');
  }
  
  let result;
  
  if (action === 'approve') {
    await appointment.approveAppointment(this.empID, this.name, `Override approval: ${reason}`);
    result = { appointmentID, action: 'approved', reason };
  } else if (action === 'decline') {
    await appointment.declineAppointment(this.empID, this.name, `Override decline: ${reason}`);
    result = { appointmentID, action: 'declined', reason };
  } else {
    throw new Error('Invalid override action');
  }
  
  // Send notification to patient about override
  const patientNotification = new Notification({
    recipientId: appointment.patientID,
    recipientType: 'patient',
    message: `Your appointment has been ${action}d by management override. Reason: ${reason}`,
    type: action === 'approve' ? 'appointment_approved' : 'appointment_declined',
    priority: 'high',
    dataSent: {
      appointmentID: appointment.appointmentID,
      action: action,
      reason: reason,
      overrideData: overrideData
    },
    metadata: {
      senderId: this.empID,
      senderType: 'healthCareManager',
      relatedEntityId: appointment.appointmentID,
      relatedEntityType: 'appointment',
      category: 'administrative'
    }
  });
  
  await patientNotification.save();
  await patientNotification.sendNotification(this.empID, 'healthCareManager', ['in_app', 'email', 'sms']);
  
  return result;
};

// Static methods
healthCareManagerSchema.statics.findByHospital = function(hospitalId) {
  return this.find({ 'assignedHospital.hospitalId': hospitalId, status: 'active' });
};

healthCareManagerSchema.statics.findByManagementLevel = function(level) {
  return this.find({ managementLevel: level, status: 'active' });
};

healthCareManagerSchema.statics.findByDepartment = function(departmentId) {
  return this.find({ 
    'departmentsManaged.departmentId': departmentId,
    'departmentsManaged.status': 'active',
    status: 'active'
  });
};

healthCareManagerSchema.statics.findByCertification = function(certification) {
  return this.find({ 
    'managementCertifications.name': certification, 
    status: 'active' 
  });
};

// Pre-save middleware
healthCareManagerSchema.pre('save', function(next) {
  // Calculate budget utilization
  if (this.budgetResponsibilities.annualBudget > 0) {
    this.performanceMetrics.budgetUtilization = 
      (this.budgetResponsibilities.currentSpent / this.budgetResponsibilities.annualBudget) * 100;
  }
  next();
});

// Merge employee base schema with healthcare manager schema
const mergedHealthCareManagerSchema = new mongoose.Schema({
  ...employeeBaseSchema.obj,
  ...healthCareManagerSchema.obj
});

// Copy methods from employee base schema
Object.assign(mergedHealthCareManagerSchema.methods, employeeBaseSchema.methods);
Object.assign(mergedHealthCareManagerSchema.statics, employeeBaseSchema.statics);

// Add healthcare manager-specific methods
Object.assign(mergedHealthCareManagerSchema.methods, healthCareManagerSchema.methods);

// Create HealthCareManager model using discriminator pattern on User
const HealthCareManager = User.discriminator('healthCareManager', mergedHealthCareManagerSchema);

export default HealthCareManager;
