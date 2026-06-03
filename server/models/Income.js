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

export default mongoose.model('Income', incomeSchema);
