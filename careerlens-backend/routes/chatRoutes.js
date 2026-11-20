import express from 'express';
import {
  getChatHistory,
  saveChatMessage,
} from '../controllers/chatController.js';

const router = express.Router();

router.get('/user/:userId', getChatHistory);
router.post('/', saveChatMessage);

export default router;
