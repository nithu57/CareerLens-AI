import { RoadmapMilestone } from '../models/RoadmapMilestone.js';
import { Roadmap } from '../models/Roadmap.js';
import { calculateAndSaveConfidenceScore } from '../services/confidenceService.js';

export const getRoadmapMilestones = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const milestones = await RoadmapMilestone.find({ userId }).sort({ weekNumber: 1 });
    return res.status(200).json({
      status: 'success',
      count: milestones.length,
      data: milestones,
    });
  } catch (error) {
    console.error('Error fetching roadmap from MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const batchSaveMilestones = async (req, res) => {
  try {
    const { userId } = req.params;
    const { milestones } = req.body;

    if (!userId || !Array.isArray(milestones)) {
      return res.status(400).json({
        status: 'error',
        message: 'userId and milestones array are required',
      });
    }

    const operations = milestones.map((m) => ({
      updateOne: {
        filter: { userId, milestoneId: m.milestoneId || m.id },
        update: {
          $set: {
            userId,
            milestoneId: m.milestoneId || m.id,
            weekNumber: m.weekNumber,
            title: m.title,
            estimatedHours: m.estimatedHours,
            objectives: m.objectives || [],
            actionItems: m.actionItems || [],
            practicalExercises: m.practicalExercises || [],
            portfolioProject: m.portfolioProject || null,
            verifiedResources: m.verifiedResources || [],
            completed: m.completed || false,
            completedAt: m.completedAt || null,
          },
        },
        upsert: true,
      },
    }));

    await RoadmapMilestone.bulkWrite(operations);

    const updatedList = await RoadmapMilestone.find({ userId }).sort({ weekNumber: 1 });
    const completedList = updatedList.filter((m) => m.completed).map((m) => m.milestoneId);
    const pendingList = updatedList.filter((m) => !m.completed).map((m) => m.milestoneId);
    const progressPercent = updatedList.length > 0 ? Math.round((completedList.length / updatedList.length) * 100) : 0;

    await Roadmap.findOneAndUpdate(
      { $or: [{ userId }, { firebaseUid: userId }] },
      {
        $set: {
          userId,
          firebaseUid: userId,
          targetRole: updatedList[0]?.title ? 'Curriculum' : 'Developer',
          durationWeeks: updatedList.length,
          progressPercent,
          completedMilestones: completedList,
          pendingMilestones: pendingList,
          status: progressPercent === 100 ? 'completed' : 'in_progress',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).catch((e) => console.warn('Roadmap summary sync note:', e));

    // Trigger non-blocking automatic confidence score recalculation
    calculateAndSaveConfidenceScore(userId).catch((err) =>
      console.warn('[ConfidenceScore] Auto-recalculate notice:', err.message)
    );

    return res.status(200).json({
      status: 'success',
      message: 'Roadmap milestones saved to MongoDB',
      data: updatedList,
    });
  } catch (error) {
    console.error('Error batch saving roadmap to MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const toggleMilestone = async (req, res) => {
  try {
    const { userId, milestoneId } = req.params;
    const { completed } = req.body;

    const updated = await RoadmapMilestone.findOneAndUpdate(
      { userId, milestoneId },
      {
        $set: {
          completed: !!completed,
          completedAt: completed ? new Date() : null,
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Milestone not found' });
    }

    // Update overall roadmap summary
    const allMilestones = await RoadmapMilestone.find({ userId });
    const completedList = allMilestones.filter((m) => m.completed).map((m) => m.milestoneId);
    const pendingList = allMilestones.filter((m) => !m.completed).map((m) => m.milestoneId);
    const progressPercent = allMilestones.length > 0 ? Math.round((completedList.length / allMilestones.length) * 100) : 0;

    await Roadmap.findOneAndUpdate(
      { $or: [{ userId }, { firebaseUid: userId }] },
      {
        $set: {
          progressPercent,
          completedMilestones: completedList,
          pendingMilestones: pendingList,
          status: progressPercent === 100 ? 'completed' : 'in_progress',
        },
      }
    ).catch((e) => console.warn('Roadmap summary toggle sync note:', e));

    return res.status(200).json({
      status: 'success',
      message: 'Milestone status updated in MongoDB',
      data: updated,
    });
  } catch (error) {
    console.error('Error toggling milestone in MongoDB:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
