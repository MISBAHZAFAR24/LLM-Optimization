import mongoose from 'mongoose'

const usageSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true },
  provider: { type: String, required: true, trim: true, maxlength: 100 },
  model: { type: String, required: true, trim: true, maxlength: 150 },
  requests: { type: Number, required: true, min: 0 },
  input_tokens: { type: Number, required: true, min: 0 },
  output_tokens: { type: Number, required: true, min: 0 },
  cost: { type: Number, required: true, min: 0 },
  latency_ms: { type: Number, required: true, min: 0 },
}, { timestamps: true, collection: 'llm_usage' })

export default mongoose.model('Usage', usageSchema)
