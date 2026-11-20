import express from 'express';
import {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notificationController.js';

const router = express.Router();

router.post('/', createNotification);
router.get('/user/:userId', getNotifications);
router.put('/:id/read', markNotificationAsRead);
router.put('/user/:userId/read-all', markAllNotificationsAsRead);

export default router;
