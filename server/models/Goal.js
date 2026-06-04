import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    completed: { default: false, type: Boolean },
    title: { required: true, type: String },
  },
  { _id: true },
);

const goalSchema = new mongoose.Schema(
  {
    category: { enum: ['career', 'business', 'financial', 'health', 'learning'], required: true, type: String },
    deadline: Date,
    description: { default: '', type: String },
    milestones: [milestoneSchema],
    progress: { default: 0, max: 100, min: 0, type: Number },
    status: { default: 'active', enum: ['active', 'completed', 'paused'], type: String },
    title: { required: true, trim: true, type: String },
    user: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

goalSchema.index({ user: 1, status: 1, deadline: 1 });
goalSchema.index({ user: 1, category: 1, createdAt: -1 });
goalSchema.index({ user: 1, updatedAt: -1 });

export default mongoose.model('Goal', goalSchema);
