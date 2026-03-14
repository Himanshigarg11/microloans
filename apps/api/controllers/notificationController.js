const NotificationService = require('../services/notificationService');

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const notifications = await NotificationService.getUserNotifications(userId);
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

const markAllRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await NotificationService.markAllAsRead(userId);
    res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notifications',
      error: error.message
    });
  }
};

module.exports = {
  getMyNotifications,
  markAllRead
};

