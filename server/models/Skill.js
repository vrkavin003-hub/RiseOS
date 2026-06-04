import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    category: {
      enum: ['Programming', 'AI', 'Communication', 'Leadership', 'Marketing', 'Sales', 'Finance', 'Business Strategy', 'Networking', 'Other'],
      required: true,
      type: String,
    },
    learningHours: { default: 0, type: Number },
    notes: { default: '', type: String },
    progress: { default: 0, max: 100, min: 0, type: Number },
    recommendations: [{ type: String }],
    user: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

skillSchema.index({ user: 1, category: 1 });
skillSchema.index({ user: 1, progress: -1 });
skillSchema.index({ user: 1, updatedAt: -1 });

export default mongoose.model('Skill', skillSchema);
