import express from 'express';
import {
  saveSkillAnalysis,
  getSkillAnalyses,
  getLatestSkillAnalysis,
} from '../controllers/skillAnalysisController.js';

const router = express.Router();

router.post('/', saveSkillAnalysis);
router.get('/user/:userId', getSkillAnalyses);
router.get('/user/:userId/latest', getLatestSkillAnalysis);

export default router;
