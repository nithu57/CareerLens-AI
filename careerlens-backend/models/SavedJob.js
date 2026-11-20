import mongoose from 'mongoose';

const JobListingSubSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: String, default: null },
    description: { type: String, default: '' },
    redirectUrl: { type: String, default: '' },
    provider: { type: String, default: 'CareerLens Verified' },
    postedDate: { type: String, default: null },
    retrievedAt: { type: String, default: () => new Date().toISOString() },
    requiredSkills: { type: [String], default: [] },
    contractType: { type: String, default: 'Full Time' },
    isRemote: { type: Boolean, default: false },
  },
  { _id: false }
);

const SavedJobSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    job: {
      type: JobListingSubSchema,
      required: true,
    },
    matchScore: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['Saved', 'Applied', 'Interviewing', 'Offer', 'Archived'],
      default: 'Saved',
    },
    notes: {
      type: String,
      default: '',
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so a user cannot duplicate a saved job
SavedJobSchema.index({ userId: 1, 'job.id': 1 }, { unique: true });

export const SavedJob = mongoose.model('SavedJob', SavedJobSchema);
