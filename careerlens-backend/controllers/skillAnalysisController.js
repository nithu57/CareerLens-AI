import { SkillAnalysis } from '../models/SkillAnalysis.js';
import { User } from '../models/User.js';

export const saveSkillAnalysis = async (req, res) => {
  try {
    const userId = req.body.userId || req.firebaseUid || req.user?.firebaseUid;
    const {
      targetRole,
      readinessScore,
      matchedSkills = [],
      missingSkills = [],
      recommendedSkills = [],
      learningRecommendations = [],
      skillBreakdown = {},
    } = req.body;

    if (!userId || !targetRole) {
      return res.status(400).json({ status: 'error', message: 'userId and targetRole are required' });
    }

    const record = await SkillAnalysis.create({
      userId,
      firebaseUid: userId,
      targetRole,
      readinessScore: Number(readinessScore) || 0,
      matchedSkills,
      missingSkills,
      recommendedSkills,
      learningRecommendations,
      skillBreakdown,
      analyzedAt: new Date(),
    });

    // Also update user's careerReadinessScore in MongoDB
    if (readinessScore) {
      await User.findOneAndUpdate(
        { $or: [{ firebaseUid: userId }, { uid: userId }] },
        { $set: { careerReadinessScore: Number(readinessScore) } }
      ).catch((e) => console.warn('User readiness score update note:', e));
    }

    return res.status(201).json({
      status: 'success',
      message: 'Skill gap analysis saved to MongoDB',
      data: record,
    });
  } catch (error) {
    console.error('Error saving skill analysis:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getSkillAnalyses = async (req, res) => {
  try {
    const userId = req.params.userId || req.firebaseUid || req.user?.firebaseUid;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const analyses = await SkillAnalysis.find({
      $or: [{ userId }, { firebaseUid: userId }],
    }).sort({ analyzedAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: analyses.length,
      data: analyses,
    });
  } catch (error) {
    console.error('Error fetching skill analyses:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getLatestSkillAnalysis = async (req, res) => {
  try {
    const userId = req.params.userId || req.firebaseUid || req.user?.firebaseUid;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const latest = await SkillAnalysis.findOne({
      $or: [{ userId }, { firebaseUid: userId }],
    }).sort({ analyzedAt: -1 });

    return res.status(200).json({
      status: 'success',
      data: latest,
    });
  } catch (error) {
    console.error('Error fetching latest skill analysis:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
