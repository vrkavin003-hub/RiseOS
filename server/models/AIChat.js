import mongoose from 'mongoose';

const aiChatSchema = new mongoose.Schema(
  {
    messages: [
      {
        content: { required: true, type: String },
        role: { enum: ['user', 'assistant', 'system'], required: true, type: String },
      },
    ],
    title: { default: 'New coaching session', type: String },
    user: { index: true, ref: 'User', required: true, type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

export default mongoose.model('AIChat', aiChatSchema);
