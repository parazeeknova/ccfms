import { Router } from 'express'
import { AlertService } from '../services/alert'

const router = Router()
const alertService = new AlertService()

router.post('/', async (req, res) => {
  try {
    const alertData = {
      vehicleVin: req.body.vehicleVin,
      telemetryId: req.body.telemetryId,
      alertType: req.body.alertType,
      severity: req.body.severity,
      message: req.body.message,
      resolved: req.body.resolved || false,
    }

    const alert = await alertService.createAlert(alertData)
    res.status(201).json(alert)
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

router.get('/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'invalid alert ID' })
    }

    const alert = await alertService.getAlertById(id)
    res.json(alert)
  }
  catch (error) {
    if (error instanceof Error && error.message === 'alert not found') {
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

router.get('/count/total', async (req, res) => {
  try {
    const { vehicleVin, alertType, severity, resolved, startTime, endTime } = req.query

    const filters = {
      vehicleVin: vehicleVin as string,
      alertType: alertType as string,
      severity: severity as string,
      resolved: resolved === 'true' ? true : resolved === 'false' ? false : undefined,
      startTime: startTime as string,
      endTime: endTime as string,
    }

    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters]
      }
    })

    const count = await alertService.getAlertCount(filters)
    res.json({ count })
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

export default router
