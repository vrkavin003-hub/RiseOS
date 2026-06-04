import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    businessImpact: String,
    careerImpact: String,
    category: { index: true, type: String },
    headline: { required: true, type: String },
    impactScore: { default: 0, max: 100, min: 0, type: Number },
    learningOpportunity: String,
    publishedAt: Date,
    savedBy: [{ ref: 'User', type: mongoose.Schema.Types.ObjectId }],
    source: String,
    summary: String,
    url: { required: true, type: String, unique: true },
  },
  { timestamps: true },
);

newsSchema.index({ category: 1, publishedAt: -1 });
newsSchema.index({ impactScore: -1, publishedAt: -1 });
newsSchema.index({ publishedAt: -1, createdAt: -1 });
newsSchema.index({ savedBy: 1, publishedAt: -1 });

export default mongoose.model('News', newsSchema);
