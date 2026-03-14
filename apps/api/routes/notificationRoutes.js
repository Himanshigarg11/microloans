const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// @route   GET /api/notifications
// @desc    Get current user's notifications
// @access  Private
router.get('/', protect, notificationController.getMyNotifications);

// @route   PATCH /api/notifications/read-all
// @desc    Mark all current user's notifications as read
// @access  Private
router.patch('/read-all', protect, notificationController.markAllRead);

module.exports = router;

