import { Router } from 'express'
import { login, register } from '../controllers/authController.js'
import { asyncHandler, requireFields } from '../middleware/asyncHandler.js'

const router = Router()
router.post('/register', requireFields(['name', 'email', 'password']), asyncHandler(register))
router.post('/login', requireFields(['email', 'password']), asyncHandler(login))

export default router
