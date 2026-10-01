import Usage from '../models/Usage.js'
import ModelPricing from '../models/ModelPricing.js'
import { calculateCost } from '../utils/calculateCost.js'

const periods = { '7d': 7, '30d': 30, '90d': 90 }

export async function getUsageSummary(request, response) {
  const period = request.query.period || '30d'
  if (!periods[period]) {
    return response.status(400).json({ detail: 'period must be 7d, 30d, or 90d.' })
  }
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  start.setUTCDate(start.getUTCDate() - periods[period] + 1)
  const records = await Usage.find({
    owner: request.userId,
    date: { $gte: start.toISOString().slice(0, 10) },
  }).sort({ date: -1, createdAt: -1 }).lean()
  const total_requests = records.reduce((total, record) => total + record.requests, 0)

  return response.json({
    period,
    total_requests,
    total_tokens: records.reduce((total, record) => total + record.input_tokens + record.output_tokens, 0),
    total_cost: records.reduce((total, record) => total + record.cost, 0),
    average_latency_ms: total_requests
      ? Math.round(records.reduce((total, record) => total + record.latency_ms * record.requests, 0) / total_requests)
      : 0,
    records: records.slice(0, 100).map(({ date, provider, model, requests, input_tokens, output_tokens, cost }) => ({
      date, provider, model, requests, input_tokens, output_tokens, cost,
    })),
  })
}

export async function addUsageRecord(request, response) {
  const { date, provider, model } = request.body
  const parsedDate = typeof date === 'string' ? new Date(`${date}T00:00:00.000Z`) : null
  if (!parsedDate || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date ||
    !['provider', 'model'].every((field) => typeof request.body[field] === 'string' && request.body[field].trim())) {
    return response.status(400).json({ detail: 'Enter a valid date, provider, and model.' })
  }
  let cost = request.body.cost
  if (cost === undefined || cost === '') {
    const pricing = await ModelPricing.findOne({ provider: provider.trim(), model: model.trim() }).lean()
    if (!pricing) {
      return response.status(400).json({ detail: 'cost is required unless a matching model price is configured.' })
    }
    cost = calculateCost(request.body.input_tokens, request.body.output_tokens, pricing)
  }
  if (!Number.isFinite(Number(cost)) || Number(cost) < 0) {
    return response.status(400).json({ detail: 'cost must be a non-negative number.' })
  }
  const record = await Usage.create({
    ...request.body,
    date,
    provider: provider.trim(),
    model: model.trim(),
    cost: Number(cost),
    owner: request.userId,
  })
  return response.status(201).json({ id: record.id })
}
