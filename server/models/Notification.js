import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    body: { default: '', type: String },
    read: { default: false, type: Boolean },
    title: { required: true, type: String },
    type: { default: 'system', enum: ['friend', 'ai', 'habit', 'goal', 'news', 'status', 'journal', 'system'], type: String },
    user: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

export default mongoose.model('Notification', notificationSchema);
