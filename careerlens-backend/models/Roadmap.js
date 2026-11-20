import mongoose from 'mongoose';

const RoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    firebaseUid: {
      type: String,
      index: true,
      trim: true,
    },
    targetRole: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: '',
    },
    durationWeeks: {
      type: Number,
      default: 12,
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedMilestones: {
      type: [String],
      default: [],
    },
    pendingMilestones: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'paused'],
      default: 'in_progress',
    },
  },
  {
    timestamps: true,
    collection: 'roadmaps',
  }
);

RoadmapSchema.pre('save', function (next) {
  if (!this.firebaseUid && this.userId) {
    this.firebaseUid = this.userId;
  }
  if (!this.userId && this.firebaseUid) {
    this.userId = this.firebaseUid;
  }
  next();
});

export const Roadmap =
  mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema);

export default Roadmap;
