import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'milestone', 'job_alert', 'recommendation'],
      default: 'info',
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

NotificationSchema.pre('save', function (next) {
  if (!this.firebaseUid && this.userId) {
    this.firebaseUid = this.userId;
  }
  if (!this.userId && this.firebaseUid) {
    this.userId = this.firebaseUid;
  }
  next();
});

export const Notification =
  mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export default Notification;
