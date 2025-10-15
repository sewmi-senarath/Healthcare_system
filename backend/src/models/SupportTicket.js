import mongoose from 'mongoose';

/**
 * SupportTicket Model - Following Single Responsibility Principle
 * Responsible only for support ticket management functionality
 * Handles tickets raised by patients and managed by healthcare staff
 */
const supportTicketSchema = new mongoose.Schema({
  ticketID: {
    type: String,
    required: true,
    unique: true
  },
  patientID: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  issueDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    required: true,
    enum: ['open', 'in_progress', 'assigned', 'resolved', 'closed', 'cancelled'],
    default: 'open'
  },
  assignedStaffID: {
    type: String,
    ref: 'Employee',
    default: null
  },
  dateCreated: {
    type: Date,
    required: true,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: [
      'technical_issue', 'billing_inquiry', 'appointment_issue', 
      'medical_record_access', 'prescription_issue', 'general_inquiry',
      'complaint', 'feedback', 'emergency'
    ],
    required: true
  },
  resolution: {
    description: String,
    resolvedBy: String,
    resolvedDate: Date,
    resolutionNotes: String
  },
  communication: [{
    message: String,
    senderID: String,
    senderType: {
      type: String,
      enum: ['patient', 'staff', 'system']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  attachments: [{
    fileName: String,
    filePath: String,
    uploadedBy: String,
    uploadedDate: {
      type: Date,
      default: Date.now
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  estimatedResolutionTime: {
    type: Date
  },
  actualResolutionTime: {
    type: Date
  },
  escalationLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  tags: [String],
  patientSatisfactionRating: {
    type: Number,
    min: 1,
    max: 5
  },
  patientFeedback: String
});

// Instance methods - Interface Segregation Principle
supportTicketSchema.methods.createTicket = function(ticketData) {
  // This method is typically called when creating a new ticket
  // The ticket creation logic is handled in the constructor and save()
  return {
    ticketID: this.ticketID,
    patientID: this.patientID,
    issueDescription: this.issueDescription,
    status: this.status,
    priority: this.priority,
    category: this.category,
    dateCreated: this.dateCreated,
    message: 'Ticket created successfully'
  };
};

supportTicketSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '') {
  const statusChange = {
    previousStatus: this.status,
    newStatus: newStatus,
    updatedBy: updatedBy,
    updateDate: new Date(),
    notes: notes
  };
  
  // Validate status transition
  const validTransitions = {
    'open': ['in_progress', 'assigned', 'cancelled'],
    'in_progress': ['assigned', 'resolved', 'cancelled'],
    'assigned': ['in_progress', 'resolved', 'cancelled'],
    'resolved': ['closed'],
    'closed': [], // Terminal state
    'cancelled': [] // Terminal state
  };
  
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  this.lastUpdated = new Date();
  
  // Add communication entry for status change
  this.communication.push({
    message: `Status changed from ${statusChange.previousStatus} to ${newStatus}. ${notes}`,
    senderID: updatedBy,
    senderType: 'staff',
    isInternal: false
  });
  
  // Set actual resolution time if resolved
  if (newStatus === 'resolved' && !this.actualResolutionTime) {
    this.actualResolutionTime = new Date();
  }
  
  return this.save().then(() => statusChange);
};

supportTicketSchema.methods.assignStaff = function(staffID, assignedBy, notes = '') {
  if (this.status === 'closed' || this.status === 'cancelled') {
    throw new Error('Cannot assign staff to closed or cancelled ticket');
  }
  
  const assignment = {
    staffID: staffID,
    assignedBy: assignedBy,
    assignmentDate: new Date(),
    notes: notes
  };
  
  this.assignedStaffID = staffID;
  this.status = 'assigned';
  this.lastUpdated = new Date();
  
  // Add communication entry for assignment
  this.communication.push({
    message: `Ticket assigned to staff member ${staffID}. ${notes}`,
    senderID: assignedBy,
    senderType: 'staff',
    isInternal: false
  });
  
  return this.save().then(() => assignment);
};

supportTicketSchema.methods.closeTicket = function(closedBy, resolution = {}) {
  if (this.status !== 'resolved') {
    throw new Error('Ticket must be resolved before it can be closed');
  }
  
  const closure = {
    closedBy: closedBy,
    closedDate: new Date(),
    resolution: resolution
  };
  
  this.status = 'closed';
  this.lastUpdated = new Date();
  
  // Update resolution details
  this.resolution = {
    description: resolution.description || 'Ticket closed',
    resolvedBy: closedBy,
    resolvedDate: new Date(),
    resolutionNotes: resolution.notes || ''
  };
  
  // Add communication entry for closure
  this.communication.push({
    message: `Ticket closed. Resolution: ${resolution.description || 'No description provided'}`,
    senderID: closedBy,
    senderType: 'staff',
    isInternal: false
  });
  
  return this.save().then(() => closure);
};

supportTicketSchema.methods.addCommunication = function(message, senderID, senderType, isInternal = false) {
  const communication = {
    message: message,
    senderID: senderID,
    senderType: senderType,
    timestamp: new Date(),
    isInternal: isInternal
  };
  
  this.communication.push(communication);
  this.lastUpdated = new Date();
  
  return this.save().then(() => communication);
};

supportTicketSchema.methods.escalateTicket = function(escalatedBy, reason = '') {
  if (this.escalationLevel >= 3) {
    throw new Error('Maximum escalation level reached');
  }
  
  this.escalationLevel++;
  this.priority = this.escalationLevel >= 2 ? 'high' : this.priority;
  this.lastUpdated = new Date();
  
  // Add communication entry for escalation
  this.communication.push({
    message: `Ticket escalated to level ${this.escalationLevel}. Reason: ${reason}`,
    senderID: escalatedBy,
    senderType: 'staff',
    isInternal: true
  });
  
  return this.save();
};

supportTicketSchema.methods.updatePriority = function(newPriority, updatedBy, reason = '') {
  const priorityChange = {
    previousPriority: this.priority,
    newPriority: newPriority,
    updatedBy: updatedBy,
    updateDate: new Date(),
    reason: reason
  };
  
  this.priority = newPriority;
  this.lastUpdated = new Date();
  
  // Add communication entry for priority change
  this.communication.push({
    message: `Priority changed from ${priorityChange.previousPriority} to ${newPriority}. Reason: ${reason}`,
    senderID: updatedBy,
    senderType: 'staff',
    isInternal: false
  });
  
  return this.save().then(() => priorityChange);
};

supportTicketSchema.methods.addAttachment = function(attachmentData) {
  const attachment = {
    fileName: attachmentData.fileName,
    filePath: attachmentData.filePath,
    uploadedBy: attachmentData.uploadedBy,
    uploadedDate: new Date()
  };
  
  this.attachments.push(attachment);
  this.lastUpdated = new Date();
  
  return this.save().then(() => attachment);
};

supportTicketSchema.methods.addTag = function(tag, addedBy) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    this.lastUpdated = new Date();
    
    // Add communication entry for tag addition
    this.communication.push({
      message: `Tag "${tag}" added to ticket`,
      senderID: addedBy,
      senderType: 'staff',
      isInternal: true
    });
    
    return this.save();
  }
  return Promise.resolve(this);
};

supportTicketSchema.methods.rateTicket = function(rating, feedback = '') {
  if (this.status !== 'closed') {
    throw new Error('Can only rate closed tickets');
  }
  
  this.patientSatisfactionRating = rating;
  this.patientFeedback = feedback;
  this.lastUpdated = new Date();
  
  return this.save();
};

supportTicketSchema.methods.getTicketDetails = function() {
  return {
    ticketID: this.ticketID,
    patientID: this.patientID,
    issueDescription: this.issueDescription,
    status: this.status,
    assignedStaffID: this.assignedStaffID,
    dateCreated: this.dateCreated,
    priority: this.priority,
    category: this.category,
    resolution: this.resolution,
    communication: this.communication,
    attachments: this.attachments,
    lastUpdated: this.lastUpdated,
    escalationLevel: this.escalationLevel,
    tags: this.tags,
    patientSatisfactionRating: this.patientSatisfactionRating,
    patientFeedback: this.patientFeedback
  };
};

// Static methods
supportTicketSchema.statics.findByPatientID = function(patientID) {
  return this.find({ patientID }).sort({ dateCreated: -1 });
};

supportTicketSchema.statics.findByStaffID = function(staffID) {
  return this.find({ assignedStaffID: staffID }).sort({ dateCreated: -1 });
};

supportTicketSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ dateCreated: -1 });
};

supportTicketSchema.statics.findByPriority = function(priority) {
  return this.find({ priority }).sort({ dateCreated: -1 });
};

supportTicketSchema.statics.findByCategory = function(category) {
  return this.find({ category }).sort({ dateCreated: -1 });
};

supportTicketSchema.statics.findOpenTickets = function() {
  return this.find({ status: { $in: ['open', 'in_progress', 'assigned'] } }).sort({ priority: 1, dateCreated: 1 });
};

supportTicketSchema.statics.findOverdueTickets = function() {
  return this.find({
    status: { $in: ['open', 'in_progress', 'assigned'] },
    estimatedResolutionTime: { $lt: new Date() }
  }).sort({ estimatedResolutionTime: 1 });
};

supportTicketSchema.statics.getTicketStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Pre-save middleware to generate ticket ID
supportTicketSchema.pre('save', function(next) {
  if (!this.ticketID) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 6);
    this.ticketID = `TICKET${timestamp.substring(6)}${random}`.toUpperCase();
  }
  
  // Update lastUpdated timestamp
  this.lastUpdated = new Date();
  
  next();
});

// Indexes for better query performance
supportTicketSchema.index({ ticketID: 1 });
supportTicketSchema.index({ patientID: 1 });
supportTicketSchema.index({ assignedStaffID: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ priority: 1 });
supportTicketSchema.index({ dateCreated: -1 });
supportTicketSchema.index({ category: 1 });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;
