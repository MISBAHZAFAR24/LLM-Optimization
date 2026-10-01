import Optimization from '../models/Optimization.js'

export async function getOptimizationSummary(request, response) {
  const opportunities = await Optimization.find({ owner: request.userId }).sort({ createdAt: -1 }).lean()
  return response.json({
    total_opportunities: opportunities.length,
    estimated_monthly_savings: opportunities.reduce((total, item) => total + item.estimated_monthly_savings, 0),
    opportunities: opportunities.map(({ _id, title, category, description, estimated_monthly_savings, impact }) => ({
      id: String(_id), title, category, description, estimated_monthly_savings, impact,
    })),
  })
}

export async function addOptimizationOpportunity(request, response) {
  const { title, category, description, impact } = request.body
  if (![title, category, description].every((value) => typeof value === 'string' && value.trim()) ||
    !['low', 'medium', 'high'].includes(impact)) {
    return response.status(400).json({ detail: 'Provide a title, category, description, and valid impact level.' })
  }
  const opportunity = await Optimization.create({
    ...request.body,
    title: title.trim(),
    category: category.trim(),
    description: description.trim(),
    owner: request.userId,
  })
  return response.status(201).json({ id: opportunity.id })
}
