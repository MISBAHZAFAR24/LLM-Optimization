import { createHash } from 'node:crypto'
import CachedResponse from '../models/CachedResponse.js'
import Usage from '../models/Usage.js'
import { getRecommendations } from '../services/aiService.js'

export async function getAiRecommendations(request, response) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setUTCHours(0, 0, 0, 0)
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 29)
  const records = await Usage.find({ owner: request.userId })
    .where('date').gte(thirtyDaysAgo.toISOString().slice(0, 10))
    .sort({ date: -1, createdAt: -1 })
    .limit(200)
    .select('date provider model requests input_tokens output_tokens cost latency_ms -_id')
    .lean()
  if (!records.length) {
    return response.status(400).json({ detail: 'Add usage records before requesting AI recommendations.' })
  }
  const cacheKey = createHash('sha256')
    .update(JSON.stringify({ engine: 'local-rules-v1', owner: request.userId, records }))
    .digest('hex')
  const cached = await CachedResponse.findOne({ cacheKey }).lean()
  if (cached) {
    return response.json({ recommendations: cached.recommendations, cached: true })
  }

  const recommendations = await getRecommendations(records)
  await CachedResponse.findOneAndUpdate(
    { cacheKey },
    { $setOnInsert: { owner: request.userId, cacheKey, recommendations } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  return response.json({ recommendations, cached: false })
}
