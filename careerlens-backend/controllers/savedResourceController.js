import { SavedResource } from '../models/SavedResource.js';

export const saveResource = async (req, res) => {
  try {
    const userId = req.body.userId || req.firebaseUid || req.user?.firebaseUid;
    const {
      resourceId,
      title,
      url,
      type = 'course',
      platform = 'Official',
      duration = '',
      difficulty = 'Intermediate',
      tags = [],
    } = req.body;

    if (!userId || !resourceId || !title || !url) {
      return res.status(400).json({ status: 'error', message: 'Missing required resource fields' });
    }

    const saved = await SavedResource.findOneAndUpdate(
      { userId, resourceId },
      {
        $set: {
          userId,
          firebaseUid: userId,
          resourceId,
          title,
          url,
          type,
          platform,
          duration,
          difficulty,
          tags,
          savedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Learning resource bookmarked in MongoDB',
      data: saved,
    });
  } catch (error) {
    console.error('Error saving resource:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getSavedResources = async (req, res) => {
  try {
    const userId = req.params.userId || req.firebaseUid || req.user?.firebaseUid;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const resources = await SavedResource.find({
      $or: [{ userId }, { firebaseUid: userId }],
    }).sort({ savedAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    console.error('Error fetching saved resources:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const removeSavedResource = async (req, res) => {
  try {
    const { userId, resourceId } = req.params;
    await SavedResource.findOneAndDelete({
      $or: [
        { userId, resourceId },
        { firebaseUid: userId, resourceId },
      ],
    });

    return res.status(200).json({
      status: 'success',
      message: 'Resource removed from saved resources in MongoDB',
    });
  } catch (error) {
    console.error('Error removing saved resource:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
