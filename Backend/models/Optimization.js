import mongoose from 'mongoose'

const optimizationSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  category: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  estimated_monthly_savings: { type: Number, required: true, min: 0 },
  impact: { type: String, enum: ['low', 'medium', 'high'], required: true },
}, { timestamps: true, collection: 'optimization_logs' })

export default mongoose.model('Optimization', optimizationSchema)
