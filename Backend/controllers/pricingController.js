import mongoose from 'mongoose'
import ModelPricing from '../models/ModelPricing.js'
import Usage from '../models/Usage.js'

export async function getModelCosts(request, response) {
  const models = await Usage.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(request.userId) } },
    { $group: {
      _id: { provider: '$provider', model: '$model' },
      spend: { $sum: '$cost' },
      requests: { $sum: '$requests' },
    } },
    { $sort: { spend: -1 } },
  ])
  const totalSpend = models.reduce((total, item) => total + item.spend, 0)
  return response.json(models.map(({ _id, spend, requests }) => ({
    provider: _id.provider,
    model: _id.model,
    spend,
    requests,
    share: totalSpend ? Math.round((spend / totalSpend) * 100) : 0,
  })))
}

export async function getPricingRates(_request, response) {
  const rates = await ModelPricing.find().sort({ provider: 1, model: 1 }).lean()
  return response.json(rates.map(({ provider, model, input_cost_per_million, output_cost_per_million, currency }) => ({
    provider, model, input_cost_per_million, output_cost_per_million, currency,
  })))
}

export async function savePricingRate(request, response) {
  const { provider, model, input_cost_per_million, output_cost_per_million } = request.body
  if (![provider, model].every((value) => typeof value === 'string' && value.trim())) {
    return response.status(400).json({ detail: 'provider and model are required.' })
  }
  const currency = request.body.currency || 'USD'
  if (typeof currency !== 'string' || !/^[A-Za-z]{3}$/.test(currency)) {
    return response.status(400).json({ detail: 'currency must be a three-letter code.' })
  }
  const rate = await ModelPricing.findOneAndUpdate(
    { provider: provider.trim(), model: model.trim() },
    {
      provider: provider.trim(),
      model: model.trim(),
      input_cost_per_million,
      output_cost_per_million,
      currency,
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
  return response.status(200).json({ id: rate.id })
}
