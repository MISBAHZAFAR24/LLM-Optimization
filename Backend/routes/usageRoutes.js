import { Router } from 'express'
import { addUsageRecord, getUsageSummary } from '../controllers/usageController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { asyncHandler, requireFields, requireNonNegativeNumbers } from '../middleware/asyncHandler.js'

const router = Router()
router.get('/summary', requireAuth, asyncHandler(getUsageSummary))
router.post('/records', requireAuth,
  requireFields(['date', 'provider', 'model', 'requests', 'input_tokens', 'output_tokens', 'latency_ms']),
  requireNonNegativeNumbers(['requests', 'input_tokens', 'output_tokens', 'latency_ms']),
  asyncHandler(addUsageRecord))

export default router
