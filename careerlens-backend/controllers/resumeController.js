import { ResumeAnalysis } from '../models/ResumeAnalysis.js';
import { calculateAndSaveConfidenceScore } from '../services/confidenceService.js';

export const saveResumeAnalysis = async (req, res) => {
  try {
    const { userId, fileName, targetRole, readinessScore, ...rest } = req.body;
    if (!userId || !fileName || !targetRole || readinessScore === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: userId, fileName, targetRole, readinessScore',
      });
    }

    const record = new ResumeAnalysis({
      userId,
      fileName,
      targetRole,
      readinessScore,
      ...rest,
    });

    await record.save();

    // Trigger non-blocking automatic confidence score recalculation
    calculateAndSaveConfidenceScore(userId).catch((err) =>
      console.warn('[ConfidenceScore] Auto-recalculate notice:', err.message)
    );

    return res.status(201).json({
      status: 'success',
      message: 'Resume analysis stored in MongoDB',
      data: record,
    });
  } catch (error) {
    console.error('Error saving resume analysis to MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getResumeAnalyses = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const analyses = await ResumeAnalysis.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      count: analyses.length,
      data: analyses,
    });
  } catch (error) {
    console.error('Error fetching resume analyses from MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getLatestResumeAnalysis = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const latest = await ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 });
    if (!latest) {
      return res.status(404).json({ status: 'error', message: 'No resume analysis found' });
    }

    return res.status(200).json({ status: 'success', data: latest });
  } catch (error) {
    console.error('Error fetching latest analysis from MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteResumeAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    await ResumeAnalysis.findByIdAndDelete(id);
    return res.status(200).json({
      status: 'success',
      message: 'Resume analysis deleted from MongoDB',
    });
  } catch (error) {
    console.error('Error deleting resume analysis from MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
