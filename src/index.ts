import process from 'node:process'
import express from 'express'
import { db } from './db/connection'
import vehicleRoutes from './routes/vehicles'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/health', async (req, res) => {
  try {
    await db.execute('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  }
  catch {
    res.status(500).json({ status: 'error', database: 'disconnected' })
  }
})

app.use('/vehicles', vehicleRoutes)

app.listen(port, () => {
  console.log(`running on port ${port}`)
})
