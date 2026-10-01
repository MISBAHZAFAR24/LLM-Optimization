import { Router } from 'express'
import { addOptimizationOpportunity, getOptimizationSummary } from '../controllers/optimizationController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { asyncHandler, requireFields, requireNonNegativeNumbers } from '../middleware/asyncHandler.js'

const router = Router()
router.get('/summary', requireAuth, asyncHandler(getOptimizationSummary))
router.post('/opportunities', requireAuth,
  requireFields(['title', 'category', 'description', 'estimated_monthly_savings', 'impact']),
  requireNonNegativeNumbers(['estimated_monthly_savings']),
  asyncHandler(addOptimizationOpportunity))

export default router
