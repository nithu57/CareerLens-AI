import { ChatMessage } from '../models/ChatMessage.js';

export const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const messages = await ChatMessage.find({ userId }).sort({ createdAt: 1 });
    return res.status(200).json({
      status: 'success',
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching chat history from MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const saveChatMessage = async (req, res) => {
  try {
    const { userId, role, content, citations = [], suggestedFollowUps = [] } = req.body;
    if (!userId || !role || !content) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: userId, role, content',
      });
    }

    const message = new ChatMessage({
      userId,
      role,
      content,
      citations,
      suggestedFollowUps,
    });

    await message.save();

    return res.status(201).json({
      status: 'success',
      message: 'Chat message stored in MongoDB',
      data: message,
    });
  } catch (error) {
    console.error('Error saving chat message to MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
