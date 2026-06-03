import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    completions: [{ completedAt: { default: Date.now, type: Date }, note: String }],
    currentStreak: { default: 0, type: Number },
    description: { default: '', type: String },
    frequency: { default: 'daily', enum: ['daily', 'weekly', 'monthly'], type: String },
    longestStreak: { default: 0, type: Number },
    name: { required: true, trim: true, type: String },
    user: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

export default mongoose.model('Habit', habitSchema);
