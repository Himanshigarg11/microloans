const Notification = require('../models/Notification');
const { getIO } = require('../socket');

class NotificationService {
  static async createAndEmit(userId, type, options = {}) {
    const {
      loanId = null,
      offerId = null,
      message,
      metadata = {}
    } = options;

    if (!message) {
      throw new Error('Notification message is required');
    }

    const notification = await Notification.create({
      userId,
      type,
      loanId,
      offerId,
      message,
      metadata
    });

    const io = getIO();
    if (io) {
      io.to(`user:${userId.toString()}`).emit('notification', {
        id: notification._id.toString(),
        type: notification.type,
        loanId: notification.loanId,
        offerId: notification.offerId,
        message: notification.message,
        metadata: notification.metadata,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      });
    }

    return notification;
  }

  static async getUserNotifications(userId, limit = 50) {
    return Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  static async markAllAsRead(userId) {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  }
}

module.exports = NotificationService;

