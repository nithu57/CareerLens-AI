import express from 'express';
import {
  saveJob,
  getSavedJobs,
  updateSavedJobStatus,
  removeSavedJob,
} from '../controllers/savedJobController.js';

const router = express.Router();

router.post('/', saveJob);
router.get('/user/:userId', getSavedJobs);
router.put('/:id', updateSavedJobStatus);
router.delete('/user/:userId/:jobId', removeSavedJob);

export default router;
