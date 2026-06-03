import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema(
  {
    expiresAt: { index: true, required: true, type: Date },
    imageUrl: { default: '', type: String },
    privacy: { default: 'friends', enum: ['public', 'friends', 'private'], type: String },
    text: { default: '', type: String },
    user: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
    views: [{ ref: 'User', type: mongoose.Schema.Types.ObjectId }],
  },
  { timestamps: true },
);

export default mongoose.model('Status', statusSchema);
