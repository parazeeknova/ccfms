import { Router } from 'express'
import { TelemetryService } from '../services/telemetry'

const router = Router()
const telemetryService = new TelemetryService()

router.post('/', async (req, res) => {
  try {
    const telemetryData = {
      vehicleVin: req.body.vehicleVin,
      latitude: Number.parseFloat(req.body.latitude),
      longitude: Number.parseFloat(req.body.longitude),
      speed: Number.parseFloat(req.body.speed),
      engineStatus: req.body.engineStatus,
      fuelBatteryLevel: Number.parseFloat(req.body.fuelBatteryLevel),
      odometerReading: Number.parseFloat(req.body.odometerReading),
      diagnosticCodes: req.body.diagnosticCodes,
      timestamp: new Date(req.body.timestamp),
    }

    const result = await telemetryService.createTelemetryData(telemetryData)
    res.status(201).json(result)
  }
  catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message })
    }
    else {
      res.status(500).json({ error: 'server error' })
    }
  }
})

router.get('/:vin/history', async (req, res) => {
  try {
    const { vin } = req.params
    const { startTime, endTime } = req.query

    let start: Date | undefined
    let end: Date | undefined

    if (startTime) {
      start = new Date(startTime as string)
      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({ error: 'invalid startTime format' })
      }
    }

    if (endTime) {
      end = new Date(endTime as string)
      if (Number.isNaN(end.getTime())) {
        return res.status(400).json({ error: 'invalid endTime format' })
      }
    }

    const history = await telemetryService.getTelemetryHistory(vin, start, end)
    res.json({
      vehicleVin: vin,
      recordCount: history.length,
      data: history,
    })
  }
  catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message })
    }
    else {
      res.status(500).json({ error: 'server error' })
    }
  }
})

router.get('/:vin/latest', async (req, res) => {
  try {
    const { vin } = req.params
    const latest = await telemetryService.getLatestTelemetry(vin)
    res.json(latest)
  }
  catch (error) {
    if (error instanceof Error && error.message === 'no telemetry data found') {
      res.status(404).json({ error: error.message })
    }
    else if (error instanceof Error) {
      res.status(400).json({ error: error.message })
    }
    else {
      res.status(500).json({ error: 'server error' })
    }
  }
})

export default router
