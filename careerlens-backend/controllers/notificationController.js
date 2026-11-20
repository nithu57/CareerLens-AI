import { Notification } from '../models/Notification.js';

export const createNotification = async (req, res) => {
  try {
    const userId = req.body.userId || req.firebaseUid || req.user?.firebaseUid;
    const { title, message, type = 'info', link = '' } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ status: 'error', message: 'userId, title and message are required' });
    }

    const notification = await Notification.create({
      userId,
      firebaseUid: userId,
      title,
      message,
      type,
      link,
      read: false,
    });

    return res.status(201).json({
      status: 'success',
      data: notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId || req.firebaseUid || req.user?.firebaseUid;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const notifications = await Notification.find({
      $or: [{ userId }, { firebaseUid: userId }],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ status: 'error', message: 'Notification not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: notification,
    });
  } catch (error) {
    console.error('Error marking notification read:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.params.userId || req.firebaseUid || req.user?.firebaseUid;
    await Notification.updateMany(
      { $or: [{ userId }, { firebaseUid: userId }] },
      { $set: { read: true } }
    );

    return res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
