import { Router } from 'express'
import { getModelCosts, getPricingRates, savePricingRate } from '../controllers/pricingController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { asyncHandler, requireFields, requireNonNegativeNumbers } from '../middleware/asyncHandler.js'

const router = Router()
router.get('/models', requireAuth, asyncHandler(getModelCosts))
router.get('/rates', requireAuth, asyncHandler(getPricingRates))
router.post('/rates', requireAuth,
  requireFields(['provider', 'model', 'input_cost_per_million', 'output_cost_per_million']),
  requireNonNegativeNumbers(['input_cost_per_million', 'output_cost_per_million']),
  asyncHandler(savePricingRate))

export default router
