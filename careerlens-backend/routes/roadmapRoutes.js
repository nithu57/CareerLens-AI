import express from 'express';
import {
  getRoadmapMilestones,
  batchSaveMilestones,
  toggleMilestone,
} from '../controllers/roadmapController.js';

const router = express.Router();

router.get('/user/:userId', getRoadmapMilestones);
router.post('/user/:userId/batch', batchSaveMilestones);
router.put('/user/:userId/:milestoneId/toggle', toggleMilestone);

export default router;
