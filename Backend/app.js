import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import authRoutes from './routes/authRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import optimizationRoutes from './routes/optimizationRoutes.js'
import pricingRoutes from './routes/pricingRoutes.js'
import usageRoutes from './routes/usageRoutes.js'
import { errorMiddleware } from './middleware/errorMiddleware.js'

const app = express()
const origins = (process.env.FRONTEND_ORIGIN || 'https://llm-optimization.vercel.app,http://localhost:5173,http://127.0.0.1:5173')
  .split(',').map((origin) => origin.trim())

app.use(cors({ origin: origins }))
app.use(express.json({ limit: '32kb' }))
app.get('/health', (_request, response) => {
  const connected = mongoose.connection.readyState === 1
  response.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
    service: 'promptly-api',
    database: connected ? 'connected' : 'disconnected',
  })
})
app.use('/api/auth', authRoutes)
app.use('/api/usage', usageRoutes)
app.use('/api/costs', pricingRoutes)
app.use('/api/pricing', pricingRoutes)
app.use('/api/optimization', optimizationRoutes)
app.use('/api/ai', aiRoutes)
app.use(errorMiddleware)

export default app
