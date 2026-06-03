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

export default mongoose.model('Expense', expenseSchema);
