import mongoose from 'mongoose'

const cachedResponseSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cacheKey: { type: String, required: true, unique: true },
  recommendations: { type: [mongoose.Schema.Types.Mixed], required: true },
  createdAt: { type: Date, default: Date.now, expires: 86_400 },
}, { collection: 'cached_responses' })

export default mongoose.model('CachedResponse', cachedResponseSchema)
