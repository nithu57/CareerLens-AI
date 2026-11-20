import mongoose from 'mongoose';

const SkillAnalysisSchema = new mongoose.Schema(
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
    readinessScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    recommendedSkills: {
      type: [String],
      default: [],
    },
    learningRecommendations: {
      type: [String],
      default: [],
    },
    skillBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ matched: [], missing: [], recommendations: [] }),
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'skillanalyses',
  }
);

SkillAnalysisSchema.pre('save', function (next) {
  if (!this.firebaseUid && this.userId) {
    this.firebaseUid = this.userId;
  }
  if (!this.userId && this.firebaseUid) {
    this.userId = this.firebaseUid;
  }
  next();
});

export const SkillAnalysis =
  mongoose.models.SkillAnalysis || mongoose.model('SkillAnalysis', SkillAnalysisSchema);

export default SkillAnalysis;
