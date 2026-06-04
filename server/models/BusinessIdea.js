import mongoose from 'mongoose';

const businessIdeaSchema = new mongoose.Schema(
  {
    businessPlan: String,
    firstThirtyDayPlan: String,
    idea: { required: true, type: String },
    revenueModel: String,
    swot: String,
    targetCustomers: String,
    user: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

businessIdeaSchema.index({ user: 1, createdAt: -1 });
businessIdeaSchema.index({ user: 1, updatedAt: -1 });

export default mongoose.model('BusinessIdea', businessIdeaSchema);
