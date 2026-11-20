import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { syncAuthUser, getCurrentUser } from '../controllers/authController.js';

const router = express.Router();

// Synchronize authenticated Firebase account with MongoDB
router.post('/sync', requireAuth, syncAuthUser);

// Get current authenticated user profile
router.get('/me', requireAuth, getCurrentUser);

export default router;
