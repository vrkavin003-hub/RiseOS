import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    body: { default: '', type: String },
    metadata: { default: {}, type: mongoose.Schema.Types.Mixed },
    metadataKey: { default: '', index: true, type: String },
    read: { default: false, type: Boolean },
    title: { required: true, type: String },
    type: { default: 'system', enum: ['friend', 'ai', 'habit', 'goal', 'news', 'status', 'journal', 'system'], type: String },
    user: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

notificationSchema.index(
  { metadataKey: 1, user: 1 },
  { partialFilterExpression: { metadataKey: { $type: 'string', $gt: '' } }, unique: true },
);
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
