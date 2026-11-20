import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getConfidenceScore,
  calculateConfidenceScore,
  getScoreHistory,
  updateConfidenceScore,
} from '../controllers/confidenceController.js';

const router = express.Router();

// Retrieve the latest score document for the authenticated user
router.get('/', requireAuth, getConfidenceScore);

// Calculate and save the latest score permanently in MongoDB
router.post('/calculate', requireAuth, calculateConfidenceScore);

// Retrieve previous scores / history snapshots
router.get('/history', requireAuth, getScoreHistory);

// Update score-related parameters when authorized
router.put('/update', requireAuth, updateConfidenceScore);

export default router;
