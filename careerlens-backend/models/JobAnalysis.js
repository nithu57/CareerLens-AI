import mongoose from 'mongoose';

const JobAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      default: '',
    },
    matchScore: {
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
    recommendations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const JobAnalysis = mongoose.model('JobAnalysis', JobAnalysisSchema);
