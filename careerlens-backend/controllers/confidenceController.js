import {
  getLatestConfidenceScore,
  calculateAndSaveConfidenceScore,
  getConfidenceScoreHistory,
} from '../services/confidenceService.js';
import { ConfidenceScore } from '../models/ConfidenceScore.js';

/**
 * GET /api/confidence-score
 * Retrieves the latest Confidence Score document from MongoDB.
 * If not yet calculated, triggers initial calculation and persistence.
 */
export const getConfidenceScore = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid || req.user?.firebaseUid;
    if (!firebaseUid) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized: Missing user identity' });
    }

    const score = await getLatestConfidenceScore(firebaseUid);

    return res.status(200).json({
      status: 'success',
      data: score,
    });
  } catch (error) {
    console.error('Error fetching confidence score:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve confidence score from MongoDB',
      error: error.message,
    });
  }
};

/**
 * POST /api/confidence-score/calculate
 * Forces a recalculation of the user's score using their latest data across MongoDB,
 * appends to score history, and returns the updated document.
 */
export const calculateConfidenceScore = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid || req.user?.firebaseUid;
    if (!firebaseUid) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized: Missing user identity' });
    }

    const overrides = req.body || {};
    const updatedScore = await calculateAndSaveConfidenceScore(firebaseUid, overrides);

    return res.status(200).json({
      status: 'success',
      message: 'Confidence score calculated and saved permanently to MongoDB',
      data: updatedScore,
    });
  } catch (error) {
    console.error('Error calculating confidence score:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to calculate confidence score',
      error: error.message,
    });
  }
};

/**
 * GET /api/confidence-score/history
 * Returns the array of previous score calculations and trends.
 */
export const getScoreHistory = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid || req.user?.firebaseUid;
    if (!firebaseUid) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized: Missing user identity' });
    }

    const history = await getConfidenceScoreHistory(firebaseUid);

    return res.status(200).json({
      status: 'success',
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching confidence score history:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve score history',
      error: error.message,
    });
  }
};

/**
 * PUT /api/confidence-score/update
 * Updates score parameters (such as mock interview performance or recommendations)
 * and recalculates overall score.
 */
export const updateConfidenceScore = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid || req.user?.firebaseUid;
    if (!firebaseUid) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized: Missing user identity' });
    }

    const {
      mockInterviewScore,
      technicalSkillsScore,
      resumeScore,
      roadmapProgressScore,
      educationExperienceScore,
      recommendations,
      strengths,
      weaknesses,
    } = req.body;

    const overrides = {
      ...(typeof mockInterviewScore === 'number' && { mockInterviewScore }),
      ...(typeof technicalSkillsScore === 'number' && { technicalSkillsScore }),
      ...(typeof resumeScore === 'number' && { resumeScore }),
      ...(typeof roadmapProgressScore === 'number' && { roadmapProgressScore }),
      ...(typeof educationExperienceScore === 'number' && { educationExperienceScore }),
    };

    const updated = await calculateAndSaveConfidenceScore(firebaseUid, overrides);

    // Apply manual overrides for qualitative lists if provided
    if (Array.isArray(recommendations) || Array.isArray(strengths) || Array.isArray(weaknesses)) {
      if (Array.isArray(recommendations)) updated.recommendations = recommendations;
      if (Array.isArray(strengths)) updated.strengths = strengths;
      if (Array.isArray(weaknesses)) updated.weaknesses = weaknesses;
      await updated.save();
    }

    return res.status(200).json({
      status: 'success',
      message: 'Confidence score updated and saved to MongoDB',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating confidence score:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update confidence score',
      error: error.message,
    });
  }
};
