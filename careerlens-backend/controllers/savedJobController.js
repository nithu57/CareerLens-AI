import mongoose from 'mongoose';
import { SavedJob } from '../models/SavedJob.js';

export const saveJob = async (req, res) => {
  try {
    const { userId, job, status = 'Saved', notes = '', matchScore = null } = req.body;
    if (!userId || !job || !job.id) {
      return res.status(400).json({ status: 'error', message: 'Missing userId or job object' });
    }

    const savedJob = await SavedJob.findOneAndUpdate(
      { userId, 'job.id': job.id },
      {
        $set: {
          userId,
          job,
          status,
          notes,
          matchScore,
          savedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Job bookmarked in MongoDB',
      data: savedJob,
    });
  } catch (error) {
    console.error('Error saving job to MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const jobs = await SavedJob.find({ userId }).sort({ savedAt: -1 });
    return res.status(200).json({
      status: 'success',
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error('Error fetching saved jobs from MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateSavedJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, userId } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    let updated = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await SavedJob.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true }
      );
    }
    if (!updated && userId) {
      updated = await SavedJob.findOneAndUpdate(
        { userId, 'job.id': id },
        { $set: updateFields },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Saved job not found' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Saved job status updated in MongoDB',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating saved job in MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const removeSavedJob = async (req, res) => {
  try {
    const { userId, jobId } = req.params;
    await SavedJob.findOneAndDelete({ userId, 'job.id': jobId });

    return res.status(200).json({
      status: 'success',
      message: 'Job removed from saved jobs in MongoDB',
    });
  } catch (error) {
    console.error('Error removing saved job from MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
