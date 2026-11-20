import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getUserProfile,
  updateUserProfile,
  upsertUserProfile,
  deleteUserAccount,
} from '../controllers/userController.js';

const router = express.Router();

// Protected profile endpoints
router.get('/profile', requireAuth, getUserProfile);
router.put('/profile', requireAuth, updateUserProfile);
router.delete('/account', requireAuth, deleteUserAccount);

// Direct uid endpoints (supporting legacy and public lookup)
router.get('/:uid', getUserProfile);
router.put('/:uid', updateUserProfile);
router.post('/', upsertUserProfile);

export default router;
