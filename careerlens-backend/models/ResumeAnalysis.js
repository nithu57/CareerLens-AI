import mongoose from 'mongoose';

const EducationItemSchema = new mongoose.Schema(
  {
    institution: { type: String, default: '' },
    degree: { type: String, default: '' },
    fieldOfStudy: { type: String, default: '' },
    graduationYear: { type: String, default: '' },
  },
  { _id: false }
);

const WorkExperienceItemSchema = new mongoose.Schema(
  {
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    duration: { type: String, default: '' },
    description: { type: String, default: '' },
    technologiesUsed: { type: [String], default: [] },
  },
  { _id: false }
);

const ExtractedDataSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    summary: { type: String, default: '' },
    education: { type: [EducationItemSchema], default: [] },
    technicalSkills: { type: [String], default: [] },
    softSkills: { type: [String], default: [] },
    toolsAndFrameworks: { type: [String], default: [] },
    workExperience: { type: [WorkExperienceItemSchema], default: [] },
  },
  { _id: false }
);

const SkillCategoryBreakdownSchema = new mongoose.Schema(
  {
    matched: { type: [String], default: [] },
    needsImprovement: { type: [String], default: [] },
    missing: { type: [String], default: [] },
    requiresVerification: { type: [String], default: [] },
  },
  { _id: false }
);

const ResumeAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    extractedText: {
      type: String,
      default: '',
    },
    targetRole: {
      type: String,
      required: true,
    },
    readinessScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    extractedData: {
      type: ExtractedDataSchema,
      default: () => ({}),
    },
    skillBreakdown: {
      type: SkillCategoryBreakdownSchema,
      default: () => ({}),
    },
    improvements: {
      type: [String],
      default: [],
    },
    isUserVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ResumeAnalysis = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema);
