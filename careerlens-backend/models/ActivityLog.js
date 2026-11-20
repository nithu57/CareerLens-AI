import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
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
    action: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'activitylogs',
  }
);

ActivityLogSchema.pre('save', function (next) {
  if (!this.firebaseUid && this.userId) {
    this.firebaseUid = this.userId;
  }
  if (!this.userId && this.firebaseUid) {
    this.userId = this.firebaseUid;
  }
  next();
});

export const ActivityLog =
  mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);

export default ActivityLog;
