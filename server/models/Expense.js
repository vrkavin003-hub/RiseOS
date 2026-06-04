import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    amount: { min: 0, required: true, type: Number },
    category: { default: 'general', type: String },
    date: { default: Date.now, type: Date },
    note: String,
    user: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1, date: -1 });

export default mongoose.model('Expense', expenseSchema);
