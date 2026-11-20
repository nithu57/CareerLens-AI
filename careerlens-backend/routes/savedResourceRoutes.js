import express from 'express';
import {
  saveResource,
  getSavedResources,
  removeSavedResource,
} from '../controllers/savedResourceController.js';

const router = express.Router();

router.post('/', saveResource);
router.get('/user/:userId', getSavedResources);
router.delete('/user/:userId/:resourceId', removeSavedResource);

export default router;
