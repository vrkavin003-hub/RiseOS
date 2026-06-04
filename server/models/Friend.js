import mongoose from 'mongoose';

const friendSchema = new mongoose.Schema(
  {
    acceptedAt: { default: Date.now, type: Date },
    pairKey: { index: true, required: true, type: String, unique: true },
    requester: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
    recipient: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
    request: { ref: 'FriendRequest', type: mongoose.Schema.Types.ObjectId },
    users: {
      index: true,
      required: true,
      type: [{ ref: 'User', type: mongoose.Schema.Types.ObjectId }],
      validate: {
        message: 'Friend connection requires exactly two users',
        validator(value) {
          return Array.isArray(value) && value.length === 2 && String(value[0]) !== String(value[1]);
        },
      },
    },
  },
  { timestamps: true },
);

friendSchema.pre('validate', function sortUserPair(next) {
  if (this.requester && this.recipient) {
    const users = [this.requester, this.recipient].map((id) => id.toString()).sort();
    this.users = users;
    this.pairKey = users.join(':');
  }
  next();
});

friendSchema.index({ users: 1 });
friendSchema.index({ updatedAt: -1 });

export default mongoose.model('Friend', friendSchema);
