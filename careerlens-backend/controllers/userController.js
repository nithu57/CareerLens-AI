import { User } from '../models/User.js';
import { ConfidenceScore } from '../models/ConfidenceScore.js';
import { calculateAndSaveConfidenceScore } from '../services/confidenceService.js';

/**
 * GET /api/users/profile
 * Retrieves profile of the authenticated user.
 */
export const getUserProfile = async (req, res) => {
  try {
    const targetUid = req.params.uid || req.firebaseUid || req.user?.firebaseUid;
    if (!targetUid) {
      return res.status(400).json({ status: 'error', message: 'User UID is required' });
    }

    const user = await User.findOne({
      $or: [{ firebaseUid: targetUid }, { uid: targetUid }],
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found in MongoDB' });
    }

    return res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    console.error('Error fetching user profile from MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * PUT /api/users/profile
 * Updates the authenticated user's profile in MongoDB and auto-recalculates confidence score.
 */
export const updateUserProfile = async (req, res) => {
  try {
    const targetUid = req.params.uid || req.firebaseUid || req.user?.firebaseUid;
    if (!targetUid) {
      return res.status(400).json({ status: 'error', message: 'User UID is required' });
    }

    const updates = { ...req.body };
    delete updates._id;
    delete updates.firebaseUid; // prevent tampering with primary auth UID

    const user = await User.findOneAndUpdate(
      { $or: [{ firebaseUid: targetUid }, { uid: targetUid }] },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Trigger non-blocking automatic confidence score recalculation when profile / skills change
    calculateAndSaveConfidenceScore(targetUid).catch((err) =>
      console.warn('[ConfidenceScore] Auto-recalculate notice:', err.message)
    );

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated in MongoDB successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error updating user in MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * POST /api/users (legacy upsert for non-token calls)
 */
export const upsertUserProfile = async (req, res) => {
  try {
    const { uid, firebaseUid, email, displayName, ...rest } = req.body;
    const finalUid = firebaseUid || uid;
    if (!finalUid) {
      return res.status(400).json({ status: 'error', message: 'User UID is required' });
    }

    const updateData = {
      firebaseUid: finalUid,
      uid: finalUid,
      ...(email && { email: email.toLowerCase() }),
      ...(displayName && { displayName, name: displayName }),
      ...rest,
    };

    const user = await User.findOneAndUpdate(
      { $or: [{ firebaseUid: finalUid }, { uid: finalUid }] },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Trigger non-blocking automatic confidence score recalculation
    calculateAndSaveConfidenceScore(finalUid).catch((err) =>
      console.warn('[ConfidenceScore] Auto-recalculate notice:', err.message)
    );

    return res.status(200).json({
      status: 'success',
      message: 'User profile saved to MongoDB successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error saving user to MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * DELETE /api/users/account
 * Deletes user profile and related records from MongoDB.
 */
export const deleteUserAccount = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid || req.user?.firebaseUid;
    if (!firebaseUid) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    await User.findOneAndDelete({
      $or: [{ firebaseUid }, { uid: firebaseUid }],
    });

    await ConfidenceScore.deleteMany({
      $or: [{ firebaseUid }, { userId: firebaseUid }],
    });

    return res.status(200).json({
      status: 'success',
      message: 'Account and profile deleted successfully from MongoDB',
    });
  } catch (error) {
    console.error('Error deleting account from MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
