import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    createdAt: { default: Date.now, type: Date },
    expiresAt: Date,
    tokenHash: { required: true, type: String },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    aiPreferences: {
      coachingStyle: { default: 'direct', enum: ['direct', 'supportive', 'strategic', 'analytical'], type: String },
      focusAreas: [{ type: String }],
    },
    bio: { default: '', maxlength: 500, type: String },
    email: { lowercase: true, required: true, trim: true, type: String, unique: true },
    emailVerificationToken: String,
    emailVerified: { default: false, type: Boolean },
    goals: [{ type: String }],
    lastLoginAt: Date,
    location: { default: '', type: String },
    name: { required: true, trim: true, type: String },
    notificationSettings: {
      aiAdvice: { default: true, type: Boolean },
      friendRequests: { default: true, type: Boolean },
      goals: { default: true, type: Boolean },
      habits: { default: true, type: Boolean },
      news: { default: true, type: Boolean },
      journal: { default: true, type: Boolean },
    },
    password: { minlength: 8, required: true, select: false, type: String },
    passwordResetExpires: Date,
    passwordResetToken: String,
    privacySettings: {
      profileVisibility: { default: 'private', enum: ['public', 'friends', 'private'], type: String },
      statusVisibility: { default: 'friends', enum: ['public', 'friends', 'private'], type: String },
    },
    profession: { default: '', type: String },
    profilePhoto: { default: '', type: String },
    refreshTokens: [refreshTokenSchema],
    role: { default: 'user', enum: ['user', 'admin'], type: String },
    themePreference: { default: 'dark', enum: ['dark', 'system'], type: String },
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  delete user.passwordResetToken;
  delete user.emailVerificationToken;
  return user;
};

export default mongoose.model('User', userSchema);
