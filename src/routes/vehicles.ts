import { Router } from 'express'
import { VehicleService } from '../services/vehicle'

const router = Router()
const vehicleService = new VehicleService()

router.post('/', async (req, res) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body)
    res.status(201).json(vehicle)
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

router.get('/', async (req, res) => {
  try {
    const { manufacturer, fleetId, registrationStatus } = req.query
    const filters = {
      manufacturer: manufacturer as string,
      fleetId: fleetId as string,
      registrationStatus: registrationStatus as string,
    }

    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters]
      }
    })

    const vehicles = await vehicleService.getAllVehicles(Object.keys(filters).length > 0 ? filters : undefined)
    res.json(vehicles)
  }
  catch {
    res.status(500).json({ error: 'server error' })
  }
})

router.get('/:vin', async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleByVin(req.params.vin)
    res.json(vehicle)
  }
  catch (error) {
    if (error instanceof Error && error.message === 'vehicle not found') {
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

router.put('/:vin', async (req, res) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.vin, req.body)
    res.json(vehicle)
  }
  catch (error) {
    if (error instanceof Error && error.message === 'vehicle not found') {
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

router.delete('/:vin', async (req, res) => {
  try {
    await vehicleService.deleteVehicle(req.params.vin)
    res.status(204).send()
  }
  catch (error) {
    if (error instanceof Error && error.message === 'vehicle not found') {
      res.status(404).json({ error: error.message })
    }
    else {
      res.status(500).json({ error: 'server error' })
    }
  }
})

export default router
