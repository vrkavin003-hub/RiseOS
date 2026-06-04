import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema(
  {
    expiresAt: { required: true, type: Date },
    imageUrl: { default: '', type: String },
    privacy: { default: 'friends', enum: ['public', 'friends', 'private'], type: String },
    text: { default: '', type: String },
    user: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
    views: [{ ref: 'User', type: mongoose.Schema.Types.ObjectId }],
  },
  { timestamps: true },
);

statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
statusSchema.index({ user: 1, createdAt: -1 });
statusSchema.index({ privacy: 1, expiresAt: 1, createdAt: -1 });

export default mongoose.model('Status', statusSchema);
