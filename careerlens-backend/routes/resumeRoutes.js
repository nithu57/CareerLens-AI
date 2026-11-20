import express from 'express';
import {
  saveResumeAnalysis,
  getResumeAnalyses,
  getLatestResumeAnalysis,
  deleteResumeAnalysis,
} from '../controllers/resumeController.js';

const router = express.Router();

router.post('/', saveResumeAnalysis);
router.get('/user/:userId', getResumeAnalyses);
router.get('/user/:userId/latest', getLatestResumeAnalysis);
router.delete('/:id', deleteResumeAnalysis);

export default router;
