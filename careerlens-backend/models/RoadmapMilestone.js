import mongoose from 'mongoose';

const PortfolioProjectSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    deliverable: { type: String, default: '' },
    techStack: { type: [String], default: [] },
  },
  { _id: false }
);

const VerifiedResourceSchema = new mongoose.Schema(
  {
    id: { type: String, default: '' },
    title: { type: String, default: '' },
    provider: { type: String, default: 'Official' },
    url: { type: String, default: '' },
    topic: { type: String, default: '' },
    type: { type: String, default: 'documentation' },
    isOfficial: { type: Boolean, default: true },
  },
  { _id: false }
);

const RoadmapMilestoneSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    milestoneId: {
      type: String,
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: true,
    },
    estimatedHours: {
      type: Number,
      default: 15,
    },
    objectives: {
      type: [String],
      default: [],
    },
    actionItems: {
      type: [String],
      default: [],
    },
    practicalExercises: {
      type: [String],
      default: [],
    },
    portfolioProject: {
      type: PortfolioProjectSchema,
      default: null,
    },
    verifiedResources: {
      type: [VerifiedResourceSchema],
      default: [],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

RoadmapMilestoneSchema.index({ userId: 1, milestoneId: 1 }, { unique: true });

export const RoadmapMilestone = mongoose.model('RoadmapMilestone', RoadmapMilestoneSchema);
