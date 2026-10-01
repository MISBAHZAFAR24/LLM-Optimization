import { Router } from 'express'
import { getAiRecommendations } from '../controllers/aiController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()
router.post('/recommendations', requireAuth, asyncHandler(getAiRecommendations))

export default router
