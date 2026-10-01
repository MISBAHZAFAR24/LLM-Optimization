import mongoose from 'mongoose'

const pricingSchema = new mongoose.Schema({
  provider: { type: String, required: true, trim: true, maxlength: 100 },
  model: { type: String, required: true, trim: true, maxlength: 150 },
  input_cost_per_million: { type: Number, required: true, min: 0 },
  output_cost_per_million: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD', uppercase: true, minlength: 3, maxlength: 3 },
}, { timestamps: true, collection: 'model_pricing' })

pricingSchema.index({ provider: 1, model: 1 }, { unique: true })

export default mongoose.model('ModelPricing', pricingSchema)
