import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema(
  {
    from: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
    status: { default: 'pending', enum: ['pending', 'accepted', 'rejected'], type: String },
    to: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });

export default mongoose.model('FriendRequest', friendRequestSchema);
