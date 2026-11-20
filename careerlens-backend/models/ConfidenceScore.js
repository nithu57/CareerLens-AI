import mongoose from 'mongoose';

const HistoryEntrySchema = new mongoose.Schema(
  {
    overallConfidenceScore: { type: Number, required: true },
    technicalSkillsScore: { type: Number, default: 0 },
    resumeScore: { type: Number, default: 0 },
    mockInterviewScore: { type: Number, default: 0 },
    roadmapProgressScore: { type: Number, default: 0 },
    educationExperienceScore: { type: Number, default: 0 },
    scoreChange: { type: Number, default: 0 },
    calculatedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ConfidenceScoreSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    userId: {
      type: String,
      index: true,
      trim: true,
    },
    overallConfidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    technicalSkillsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    resumeScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    mockInterviewScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    roadmapProgressScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    educationExperienceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    previousScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    scoreChange: {
      type: Number,
      default: 0,
    },
    calculationMethod: {
      type: String,
      default: 'weighted_multimodal_v1',
    },
    lastCalculatedAt: {
      type: Date,
      default: Date.now,
    },
    isLatest: {
      type: Boolean,
      default: true,
      index: true,
    },
    history: {
      type: [HistoryEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'confidencescores',
  }
);

// Compound indexes for performant history and latest lookup
ConfidenceScoreSchema.index({ firebaseUid: 1, isLatest: 1 });
ConfidenceScoreSchema.index({ firebaseUid: 1, createdAt: -1 });

// Synchronize userId with firebaseUid if one is missing
ConfidenceScoreSchema.pre('save', function (next) {
  if (!this.userId && this.firebaseUid) {
    this.userId = this.firebaseUid;
  }
  if (!this.firebaseUid && this.userId) {
    this.firebaseUid = this.userId;
  }
  next();
});

export const ConfidenceScore =
  mongoose.models.ConfidenceScore || mongoose.model('ConfidenceScore', ConfidenceScoreSchema);
export default ConfidenceScore;
