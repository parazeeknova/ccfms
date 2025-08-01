import process from 'node:process'
import cors from 'cors'
import express from 'express'
import { db } from './db/connection'
import { healthCheckLimiter } from './middleware/rateLimiter'
import alertRoutes from './routes/alerts'
import analyticsRoutes from './routes/analytics'
import telemetryRoutes from './routes/telemetry'
import vehicleRoutes from './routes/vehicles'

const app = express()
const port = process.env.PORT || 3000

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

app.get('/health', healthCheckLimiter, async (req, res) => {
  try {
    await db.execute('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  }
  catch {
    res.status(500).json({ status: 'error', database: 'disconnected' })
  }
})

app.use('/vehicles', vehicleRoutes)
app.use('/telemetry', telemetryRoutes)
app.use('/alerts', alertRoutes)
app.use('/analytics', analyticsRoutes)

app.listen(port, () => {
  console.log(`running on port ${port}`)
})
