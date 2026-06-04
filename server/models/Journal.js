import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema(
  {
    aiAnalysis: {
      opportunities: String,
      strengths: String,
      tomorrowPlan: String,
      weaknesses: String,
    },
    expenses: { default: 0, type: Number },
    failures: { default: '', type: String },
    focusScore: { default: 0, max: 10, min: 0, type: Number },
    healthActivity: { default: '', type: String },
    income: { default: 0, type: Number },
    lessons: { default: '', type: String },
    mood: { default: 'neutral', type: String },
    networkingActivity: { default: '', type: String },
    timeSpentLearning: { default: 0, type: Number },
    user: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
    whatIBuilt: { default: '', type: String },
    whatILearned: { default: '', type: String },
    wins: { default: '', type: String },
  },
  { timestamps: true },
);

journalSchema.index({ user: 1, createdAt: -1 });
journalSchema.index({ user: 1, mood: 1, createdAt: -1 });

export default mongoose.model('Journal', journalSchema);
