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

export default mongoose.model('BusinessIdea', businessIdeaSchema);
