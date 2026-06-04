import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    completions: [{ completedAt: { default: Date.now, type: Date }, note: String }],
    currentStreak: { default: 0, type: Number },
    category: {
      default: 'productivity',
      enum: ['career', 'discipline', 'finance', 'health', 'learning', 'productivity', 'other'],
      type: String,
    },
    description: { default: '', type: String },
    frequency: { default: 'daily', enum: ['daily', 'weekly', 'monthly'], type: String },
    isArchived: { default: false, type: Boolean },
    longestStreak: { default: 0, type: Number },
    name: { required: true, trim: true, type: String },
    targetPerPeriod: { default: 1, max: 20, min: 1, type: Number },
    user: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

habitSchema.index({ user: 1, isArchived: 1, frequency: 1 });
habitSchema.index({ user: 1, category: 1, updatedAt: -1 });
habitSchema.index({ user: 1, currentStreak: -1 });

export default mongoose.model('Habit', habitSchema);
