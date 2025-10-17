// repositories/NotificationRepository.js
import { BaseRepository } from './BaseRepository.js';
import Notification from '../models/Notification.js';

export class NotificationRepository extends BaseRepository {
  async findById(id) {
    return await Notification.findById(id);
  }

  async findByRecipient(recipientId, recipientType) {
    return await Notification.find({ recipientId, recipientType }).sort({ createdAt: -1 });
  }

  async findUnread(recipientId) {
    return await Notification.find({ 
      recipientId, 
      status: 'unread' 
    }).sort({ createdAt: -1 });
  }

  async create(data) {
    const notification = new Notification({
      notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
      ...data
    });
    return await notification.save();
  }

  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { status: 'read', readAt: new Date() },
      { new: true }
    );
  }

  async deleteOld(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    return await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: 'read'
    });
  }
}