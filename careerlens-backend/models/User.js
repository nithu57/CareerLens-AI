import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    // Alias uid for backward compatibility with earlier prototypes
    uid: {
      type: String,
      index: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    fullName: {
      type: String,
      trim: true,
      default: '',
    },
    displayName: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    photoURL: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    phoneNumber: {
      type: String,
      default: '',
      trim: true,
    },
    education: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        degree: '',
        university: '',
        college: '',
        graduationYear: null,
      }),
    },
    educationHistory: {
      type: Array,
      default: [],
    },
    university: {
      type: String,
      default: '',
    },
    college: {
      type: String,
      default: '',
    },
    degree: {
      type: String,
      default: '',
    },
    graduationYear: {
      type: Number,
      default: null,
    },
    skills: {
      type: [String],
      default: [],
    },
    technicalSkills: {
      type: [String],
      default: [],
    },
    programmingLanguages: {
      type: [String],
      default: [],
    },
    frontendSkills: {
      type: [String],
      default: [],
    },
    backendSkills: {
      type: [String],
      default: [],
    },
    databaseSkills: {
      type: [String],
      default: [],
    },
    frameworks: {
      type: [String],
      default: [],
    },
    toolsAndTechnologies: {
      type: [String],
      default: [],
    },
    skillProficiencies: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    experience: {
      type: String,
      default: 'Entry Level',
    },
    experienceLevel: {
      type: String,
      default: 'Entry Level',
    },
    preferredJobRoles: {
      type: [String],
      default: [],
    },
    preferredJobRole: {
      type: String,
      default: '',
    },
    targetRole: {
      type: String,
      default: '',
    },
    preferredLocation: {
      type: String,
      default: '',
    },
    workArrangement: {
      type: String,
      default: 'Remote',
    },
    weeklyHours: {
      type: Number,
      default: 20,
    },
    careerInterests: {
      type: [String],
      default: [],
    },
    careerGoals: {
      type: String,
      default: '',
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    profileCompletionPercentage: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
    careerReadinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    appearance: {
      mode: { type: String, default: 'light' },
      accentColor: { type: String, default: 'violet' },
      layoutDensity: { type: String, default: 'comfortable' },
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin'],
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Pre-save hook to keep aliases synchronized
UserSchema.pre('save', function (next) {
  if (!this.name && this.displayName) {
    this.name = this.displayName;
  }
  if (!this.displayName && this.name) {
    this.displayName = this.name;
  }
  if (!this.fullName && (this.displayName || this.name)) {
    this.fullName = this.displayName || this.name;
  }
  if (!this.name && this.fullName) {
    this.name = this.fullName;
  }
  if (!this.uid && this.firebaseUid) {
    this.uid = this.firebaseUid;
  }
  if (!this.firebaseUid && this.uid) {
    this.firebaseUid = this.uid;
  }
  if (!this.photoURL && this.profileImage) {
    this.photoURL = this.profileImage;
  }
  if (!this.profileImage && this.photoURL) {
    this.profileImage = this.photoURL;
  }
  if (!this.phone && this.phoneNumber) {
    this.phone = this.phoneNumber;
  }
  if (!this.phoneNumber && this.phone) {
    this.phoneNumber = this.phone;
  }
  if (!this.targetRole && this.preferredJobRole) {
    this.targetRole = this.preferredJobRole;
  }
  if (!this.preferredJobRole && this.targetRole) {
    this.preferredJobRole = this.targetRole;
  }
  if (!this.preferredJobRole && this.preferredJobRoles?.length > 0) {
    this.preferredJobRole = this.preferredJobRoles[0];
  }
  if (this.preferredJobRole && (!this.preferredJobRoles || this.preferredJobRoles.length === 0)) {
    this.preferredJobRoles = [this.preferredJobRole];
  }
  if (this.targetRole && (!this.preferredJobRoles || this.preferredJobRoles.length === 0)) {
    this.preferredJobRoles = [this.targetRole];
  }
  if (this.technicalSkills?.length > 0 && (!this.skills || this.skills.length === 0)) {
    this.skills = [...this.technicalSkills];
  }
  if (this.skills?.length > 0 && (!this.technicalSkills || this.technicalSkills.length === 0)) {
    this.technicalSkills = [...this.skills];
  }
  if (!this.college && this.university) {
    this.college = this.university;
  }
  if (!this.university && this.college) {
    this.university = this.college;
  }
  next();
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
