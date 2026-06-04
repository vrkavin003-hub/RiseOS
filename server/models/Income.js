import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
  {
    amount: { min: 0, required: true, type: Number },
    date: { default: Date.now, type: Date },
    note: String,
    source: { default: 'general', type: String },
    user: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

incomeSchema.index({ user: 1, date: -1 });
incomeSchema.index({ user: 1, source: 1, date: -1 });

export default mongoose.model('Income', incomeSchema);
