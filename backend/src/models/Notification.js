import mongoose from 'mongoose';

/**
 * Notification Model - Following Single Responsibility Principle
 * Responsible only for notification management functionality
 * Handles notifications sent to various users in the healthcare system
 */
const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    required: true,
    unique: true
  },
  recipientId: {
    type: String,
    required: true,
    ref: 'User'
  },
  recipientType: {
    type: String,
    enum: ['patient', 'doctor', 'pharmacist', 'nurse', 'hospitalStaff', 'healthCareManager', 'systemAdmin'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: [
      'prescription_created',
      'prescription_sent_to_pharmacy',
      'prescription_ready_for_pickup',
      'prescription_dispensed',
      'appointment_reminder',
      'appointment_confirmed',
      'appointment_cancelled',
      'medication_reminder',
      'low_stock_alert',
      'expiry_alert',
      'system_maintenance',
      'security_alert',
      'payment_due',
      'payment_confirmed',
      'support_ticket_created',
      'support_ticket_updated',
      'support_ticket_resolved',
      'general_announcement',
      'emergency_alert'
    ],
    required: true
  },
  dataSent: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent', 'emergency'],
    default: 'medium'
  },
  deliveryChannels: [{
    channel: {
      type: String,
      enum: ['email', 'sms', 'push', 'in_app', 'phone'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    },
    sentAt: Date,
    deliveredAt: Date,
    errorMessage: String,
    deliveryId: String
  }],
  metadata: {
    senderId: String,
    senderType: {
      type: String,
      enum: ['system', 'doctor', 'pharmacist', 'nurse', 'hospitalStaff', 'healthCareManager', 'systemAdmin'],
      default: 'system'
    },
    relatedEntityId: String, // ID of related prescription, appointment, etc.
    relatedEntityType: String, // prescription, appointment, support_ticket, etc.
    category: {
      type: String,
      enum: ['medical', 'administrative', 'system', 'financial', 'emergency'],
      default: 'administrative'
    },
    tags: [String],
    expiresAt: Date,
    scheduledFor: Date
  },
  interaction: {
    isInteractive: {
      type: Boolean,
      default: false
    },
    actions: [{
      actionId: String,
      actionLabel: String,
      actionType: {
        type: String,
        enum: ['button', 'link', 'form']
      },
      actionUrl: String,
      actionData: mongoose.Schema.Types.Mixed
    }],
    requiresResponse: {
      type: Boolean,
      default: false
    },
    responseDeadline: Date,
    responseReceived: {
      type: Boolean,
      default: false
    },
    responseData: mongoose.Schema.Types.Mixed
  },
  history: [{
    action: {
      type: String,
      enum: ['created', 'sent', 'delivered', 'read', 'clicked', 'responded', 'failed', 'expired'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    channel: String,
    details: String,
    data: mongoose.Schema.Types.Mixed
  }],
  readAt: Date,
  clickedAt: Date,
  respondedAt: Date,
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
notificationSchema.methods.sendNotification = function(senderId, senderType, deliveryChannels = ['in_app']) {
  const notification = {
    notificationId: this.notificationId,
    recipientId: this.recipientId,
    message: this.message,
    type: this.type,
    priority: this.priority,
    status: 'sent',
    deliveryChannels: deliveryChannels.map(channel => ({
      channel: channel,
      status: 'sent',
      sentAt: new Date()
    })),
    metadata: {
      ...this.metadata,
      senderId: senderId,
      senderType: senderType
    }
  };
  
  // Update notification
  this.status = 'sent';
  this.deliveryChannels = notification.deliveryChannels;
  this.metadata.senderId = senderId;
  this.metadata.senderType = senderType;
  this.updatedAt = new Date();
  
  // Add to history
  this.history.push({
    action: 'sent',
    timestamp: new Date(),
    details: `Notification sent via ${deliveryChannels.join(', ')}`,
    data: { deliveryChannels: deliveryChannels }
  });
  
  return this.save().then(() => notification);
};

notificationSchema.methods.updateNotification = function(updateData, updatedBy, updatedByName) {
  const allowedUpdates = [
    'message',
    'priority',
    'metadata',
    'interaction',
    'deliveryChannels'
  ];
  
  const updates = {};
  allowedUpdates.forEach(field => {
    if (updateData[field]) {
      updates[field] = updateData[field];
    }
  });
  
  // Update fields
  Object.assign(this, updates);
  this.updatedAt = new Date();
  
  // Add to history
  this.history.push({
    action: 'updated',
    timestamp: new Date(),
    details: 'Notification updated',
    data: {
      updatedFields: Object.keys(updates),
      updatedBy: updatedBy
    }
  });
  
  return this.save().then(() => ({
    notificationId: this.notificationId,
    updatedFields: Object.keys(updates),
    updatedAt: this.updatedAt
  }));
};

notificationSchema.methods.viewNotificationHistory = function(viewedBy, viewerType) {
  // Mark as read if not already read
  if (!this.readAt) {
    this.readAt = new Date();
    this.status = 'read';
    this.updatedAt = new Date();
    
    // Add to history
    this.history.push({
      action: 'read',
      timestamp: new Date(),
      details: `Notification read by ${viewerType}`,
      data: { viewerType: viewerType }
    });
  }
  
  const history = this.history.sort((a, b) => b.timestamp - a.timestamp);
  
  return {
    notificationId: this.notificationId,
    recipientId: this.recipientId,
    message: this.message,
    type: this.type,
    status: this.status,
    priority: this.priority,
    createdAt: this.createdAt,
    readAt: this.readAt,
    history: history
  };
};

notificationSchema.methods.markAsRead = function(readBy, readByType) {
  if (!this.readAt) {
    this.readAt = new Date();
    this.status = 'read';
    this.updatedAt = new Date();
    
    // Add to history
    this.history.push({
      action: 'read',
      timestamp: new Date(),
      details: `Marked as read by ${readByType}`,
      data: { readBy: readBy, readByType: readByType }
    });
    
    return this.save();
  }
  return Promise.resolve(this);
};

notificationSchema.methods.markAsDelivered = function(channel, deliveryId) {
  const deliveryChannel = this.deliveryChannels.find(ch => ch.channel === channel);
  if (deliveryChannel) {
    deliveryChannel.status = 'delivered';
    deliveryChannel.deliveredAt = new Date();
    deliveryChannel.deliveryId = deliveryId;
  }
  
  // Update overall status if all channels are delivered
  const allDelivered = this.deliveryChannels.every(ch => ch.status === 'delivered');
  if (allDelivered && this.status === 'sent') {
    this.status = 'delivered';
  }
  
  this.updatedAt = new Date();
  
  // Add to history
  this.history.push({
    action: 'delivered',
    timestamp: new Date(),
    channel: channel,
    details: `Notification delivered via ${channel}`,
    data: { deliveryId: deliveryId }
  });
  
  return this.save();
};

notificationSchema.methods.markAsFailed = function(channel, errorMessage) {
  const deliveryChannel = this.deliveryChannels.find(ch => ch.channel === channel);
  if (deliveryChannel) {
    deliveryChannel.status = 'failed';
    deliveryChannel.errorMessage = errorMessage;
  }
  
  // Update overall status if all channels failed
  const allFailed = this.deliveryChannels.every(ch => ch.status === 'failed');
  if (allFailed) {
    this.status = 'failed';
  }
  
  this.updatedAt = new Date();
  
  // Add to history
  this.history.push({
    action: 'failed',
    timestamp: new Date(),
    channel: channel,
    details: `Notification failed via ${channel}: ${errorMessage}`,
    data: { errorMessage: errorMessage }
  });
  
  return this.save();
};

notificationSchema.methods.handleAction = function(actionId, actionData, performedBy) {
  const action = this.interaction.actions.find(a => a.actionId === actionId);
  if (!action) {
    throw new Error('Action not found');
  }
  
  this.clickedAt = new Date();
  this.updatedAt = new Date();
  
  // Add to history
  this.history.push({
    action: 'clicked',
    timestamp: new Date(),
    details: `Action ${actionId} performed`,
    data: { actionId: actionId, actionData: actionData, performedBy: performedBy }
  });
  
  return this.save();
};

notificationSchema.methods.respondToNotification = function(responseData, respondedBy) {
  if (!this.interaction.requiresResponse) {
    throw new Error('This notification does not require a response');
  }
  
  this.interaction.responseReceived = true;
  this.interaction.responseData = responseData;
  this.respondedAt = new Date();
  this.updatedAt = new Date();
  
  // Add to history
  this.history.push({
    action: 'responded',
    timestamp: new Date(),
    details: 'Response received',
    data: { responseData: responseData, respondedBy: respondedBy }
  });
  
  return this.save();
};

notificationSchema.methods.getNotificationSummary = function() {
  return {
    notificationId: this.notificationId,
    recipientId: this.recipientId,
    message: this.message,
    type: this.type,
    status: this.status,
    priority: this.priority,
    createdAt: this.createdAt,
    readAt: this.readAt,
    isRead: !!this.readAt,
    isInteractive: this.interaction.isInteractive,
    requiresResponse: this.interaction.requiresResponse,
    responseReceived: this.interaction.responseReceived,
    deliveryChannels: this.deliveryChannels.map(ch => ({
      channel: ch.channel,
      status: ch.status
    }))
  };
};

// Static methods
notificationSchema.statics.findByNotificationId = function(notificationId) {
  return this.findOne({ notificationId });
};

notificationSchema.statics.findByRecipient = function(recipientId, recipientType) {
  return this.find({ recipientId, recipientType }).sort({ createdAt: -1 });
};

notificationSchema.statics.findByType = function(type) {
  return this.find({ type }).sort({ createdAt: -1 });
};

notificationSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

notificationSchema.statics.findByPriority = function(priority) {
  return this.find({ priority }).sort({ createdAt: -1 });
};

notificationSchema.statics.findUnreadNotifications = function(recipientId) {
  return this.find({ 
    recipientId: recipientId, 
    readAt: { $exists: false } 
  }).sort({ createdAt: -1 });
};

notificationSchema.statics.findPendingNotifications = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: 1 });
};

notificationSchema.statics.findFailedNotifications = function() {
  return this.find({ status: 'failed' }).sort({ createdAt: -1 });
};

notificationSchema.statics.findExpiredNotifications = function() {
  return this.find({
    'metadata.expiresAt': { $lt: new Date() },
    status: { $in: ['pending', 'sent'] }
  }).sort({ createdAt: -1 });
};

notificationSchema.statics.findScheduledNotifications = function() {
  return this.find({
    'metadata.scheduledFor': { $lte: new Date() },
    status: 'pending'
  }).sort({ 'metadata.scheduledFor': 1 });
};

notificationSchema.statics.getNotificationStatistics = function(filters = {}) {
  const matchQuery = {};
  
  if (filters.dateFrom || filters.dateTo) {
    matchQuery.createdAt = {};
    if (filters.dateFrom) matchQuery.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) matchQuery.createdAt.$lte = new Date(filters.dateTo);
  }
  
  if (filters.recipientType) {
    matchQuery.recipientType = filters.recipientType;
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        pendingNotifications: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        sentNotifications: {
          $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
        },
        deliveredNotifications: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        readNotifications: {
          $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
        },
        failedNotifications: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        urgentNotifications: {
          $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
        },
        emergencyNotifications: {
          $sum: { $cond: [{ $eq: ['$priority', 'emergency'] }, 1, 0] }
        },
        interactiveNotifications: {
          $sum: { $cond: ['$interaction.isInteractive', 1, 0] }
        },
        responseRequiredNotifications: {
          $sum: { $cond: ['$interaction.requiresResponse', 1, 0] }
        }
      }
    }
  ]);
};

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Generate notification ID if not provided
  if (!this.notificationId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 6);
    this.notificationId = `NOTIF${timestamp.substring(6)}${random}`.toUpperCase();
  }
  
  // Update updatedAt timestamp
  this.updatedAt = new Date();
  
  // Set default expiry date if not provided (7 days from creation)
  if (!this.metadata.expiresAt) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    this.metadata.expiresAt = expiresAt;
  }
  
  // Set default scheduled time if not provided
  if (!this.metadata.scheduledFor) {
    this.metadata.scheduledFor = new Date();
  }
  
  next();
});

// Indexes for better query performance
notificationSchema.index({ notificationId: 1 });
notificationSchema.index({ recipientId: 1 });
notificationSchema.index({ recipientType: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ readAt: 1 });
notificationSchema.index({ 'metadata.scheduledFor': 1 });
notificationSchema.index({ 'metadata.expiresAt': 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
