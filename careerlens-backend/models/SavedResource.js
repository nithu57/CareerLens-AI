import mongoose from 'mongoose';

const SavedResourceSchema = new mongoose.Schema(
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
    resourceId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: 'course',
      enum: ['video', 'course', 'documentation', 'book', 'article', 'interactive'],
    },
    platform: {
      type: String,
      default: 'Official',
    },
    duration: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      default: 'Intermediate',
    },
    tags: {
      type: [String],
      default: [],
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'savedresources',
  }
);

SavedResourceSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

SavedResourceSchema.pre('save', function (next) {
  if (!this.firebaseUid && this.userId) {
    this.firebaseUid = this.userId;
  }
  if (!this.userId && this.firebaseUid) {
    this.userId = this.firebaseUid;
  }
  next();
});

export const SavedResource =
  mongoose.models.SavedResource || mongoose.model('SavedResource', SavedResourceSchema);

export default SavedResource;
