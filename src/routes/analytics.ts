import { Router } from 'express'
import { generalLimiter, readLimiter } from '../middleware/rateLimiter'
import { AnalyticsService } from '../services/analytics'
import { AnalyticsValidator } from '../utils/validation'

const router = Router()
const analyticsService = new AnalyticsService()

router.use(generalLimiter)

router.get('/fleet', readLimiter, async (req, res) => {
  const startTime = new Date()

  try {
    const validation = AnalyticsValidator.validateAnalyticsQuery(req.query)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.errors,
        timestamp: new Date(),
      })
    }

    const params = AnalyticsValidator.sanitizeAnalyticsParams(req.query)
    const fleetAnalytics = await analyticsService.getFleetAnalytics(params)
    const responseTime = Date.now() - startTime.getTime()

    res.json({
      success: true,
      data: fleetAnalytics,
      metadata: {
        responseTime,
        cached: false, // TODO: Add cache hit detection
        timestamp: new Date(),
      },
    })
  }
  catch (error) {
    const responseTime = Date.now() - startTime.getTime()

    console.error('Fleet analytics error:', {
      error: error instanceof Error ? error.message : error,
      responseTime,
      query: req.query,
      timestamp: new Date().toISOString(),
    })

    if (error instanceof Error && error.message.includes('Time window')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        timestamp: new Date(),
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve fleet analytics',
      timestamp: new Date(),
    })
  }
})

router.get('/activity', readLimiter, async (req, res) => {
  const startTime = new Date()

  try {
    const validation = AnalyticsValidator.validateActivityQuery(req.query)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.errors,
        timestamp: new Date(),
      })
    }

    const params = AnalyticsValidator.sanitizeActivityParams(req.query)
    const activityStatus = await analyticsService.getVehicleActivityStatus(params)
    const responseTime = Date.now() - startTime.getTime()

    res.json({
      success: true,
      data: activityStatus,
      metadata: {
        responseTime,
        timestamp: new Date(),
      },
    })
  }
  catch (error) {
    const responseTime = Date.now() - startTime.getTime()

    console.error('Activity analytics error:', {
      error: error instanceof Error ? error.message : error,
      responseTime,
      query: req.query,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve activity status',
      timestamp: new Date(),
    })
  }
})

router.get('/fuel', readLimiter, async (req, res) => {
  const startTime = new Date()

  try {
    const validation = AnalyticsValidator.validateAnalyticsQuery(req.query)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.errors,
        timestamp: new Date(),
      })
    }

    const params = AnalyticsValidator.sanitizeAnalyticsParams(req.query)
    const fuelAnalytics = await analyticsService.getFleetFuelAnalytics(params)
    const responseTime = Date.now() - startTime.getTime()

    res.json({
      success: true,
      data: fuelAnalytics,
      metadata: {
        responseTime,
        timestamp: new Date(),
      },
    })
  }
  catch (error) {
    const responseTime = Date.now() - startTime.getTime()

    console.error('Fuel analytics error:', {
      error: error instanceof Error ? error.message : error,
      responseTime,
      query: req.query,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve fuel analytics',
      timestamp: new Date(),
    })
  }
})

router.get('/distance', readLimiter, async (req, res) => {
  const startTime = new Date()

  try {
    const validation = AnalyticsValidator.validateAnalyticsQuery(req.query)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.errors,
        timestamp: new Date(),
      })
    }

    const params = AnalyticsValidator.sanitizeAnalyticsParams(req.query)
    const distanceAnalytics = await analyticsService.getFleetDistanceAnalytics(params)
    const responseTime = Date.now() - startTime.getTime()

    res.json({
      success: true,
      data: distanceAnalytics,
      metadata: {
        responseTime,
        timestamp: new Date(),
      },
    })
  }
  catch (error) {
    const responseTime = Date.now() - startTime.getTime()

    console.error('Distance analytics error:', {
      error: error instanceof Error ? error.message : error,
      responseTime,
      query: req.query,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve distance analytics',
      timestamp: new Date(),
    })
  }
})

router.get('/alerts/summary', readLimiter, async (req, res) => {
  const startTime = new Date()

  try {
    const validation = AnalyticsValidator.validateAlertSummaryQuery(req.query)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.errors,
        timestamp: new Date(),
      })
    }

    const params = AnalyticsValidator.sanitizeAlertSummaryParams(req.query)
    const alertSummary = await analyticsService.getAlertSummary(params)
    const responseTime = Date.now() - startTime.getTime()

    res.json({
      success: true,
      data: alertSummary,
      metadata: {
        responseTime,
        timestamp: new Date(),
      },
    })
  }
  catch (error) {
    const responseTime = Date.now() - startTime.getTime()

    console.error('Alert summary error:', {
      error: error instanceof Error ? error.message : error,
      responseTime,
      query: req.query,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve alert summary',
      timestamp: new Date(),
    })
  }
})

router.get('/vehicles/activity', readLimiter, async (req, res) => {
  const startTime = new Date()

  try {
    const validation = AnalyticsValidator.validateActivityQuery(req.query)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.errors,
        timestamp: new Date(),
      })
    }

    const params = AnalyticsValidator.sanitizeActivityParams(req.query)
    const vehicleActivity = await analyticsService.getDetailedVehicleActivity(params)
    const responseTime = Date.now() - startTime.getTime()

    res.json({
      success: true,
      data: vehicleActivity,
      metadata: {
        responseTime,
        count: vehicleActivity.length,
        timestamp: new Date(),
      },
    })
  }
  catch (error) {
    const responseTime = Date.now() - startTime.getTime()

    console.error('Detailed vehicle activity error:', {
      error: error instanceof Error ? error.message : error,
      responseTime,
      query: req.query,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve detailed vehicle activity',
      timestamp: new Date(),
    })
  }
})

router.get('/vehicles/distances', readLimiter, async (req, res) => {
  const startTime = new Date()

  try {
    const validation = AnalyticsValidator.validateAnalyticsQuery(req.query)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.errors,
        timestamp: new Date(),
      })
    }
    const params = AnalyticsValidator.sanitizeAnalyticsParams(req.query)
    const vehicleDistances = await analyticsService.getDetailedVehicleDistances(params)
    const responseTime = Date.now() - startTime.getTime()

    res.json({
      success: true,
      data: vehicleDistances,
      metadata: {
        responseTime,
        count: vehicleDistances.length,
        timestamp: new Date(),
      },
    })
  }
  catch (error) {
    const responseTime = Date.now() - startTime.getTime()

    console.error('Detailed vehicle distances error:', {
      error: error instanceof Error ? error.message : error,
      responseTime,
      query: req.query,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve detailed vehicle distances',
      timestamp: new Date(),
    })
  }
})

router.get('/vehicles/fuel', readLimiter, async (req, res) => {
  const startTime = new Date()

  try {
    const fuelStatus = await analyticsService.getDetailedFuelStatus()
    const responseTime = Date.now() - startTime.getTime()

    res.json({
      success: true,
      data: fuelStatus,
      metadata: {
        responseTime,
        count: fuelStatus.length,
        timestamp: new Date(),
      },
    })
  }
  catch (error) {
    const responseTime = Date.now() - startTime.getTime()

    console.error('Detailed fuel status error:', {
      error: error instanceof Error ? error.message : error,
      responseTime,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve detailed fuel status',
      timestamp: new Date(),
    })
  }
})

router.post('/cache/refresh', async (req, res) => {
  const startTime = new Date()

  try {
    const { fleetId } = req.body

    if (fleetId && (typeof fleetId !== 'string' || fleetId.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Fleet ID must be a non-empty string',
        timestamp: new Date(),
      })
    }

    await analyticsService.refreshCache(fleetId)
    const responseTime = Date.now() - startTime.getTime()

    res.json({
      success: true,
      message: fleetId ? `Cache refreshed for fleet ${fleetId}` : 'Cache refreshed for all fleets',
      metadata: {
        responseTime,
        timestamp: new Date(),
      },
    })
  }
  catch (error) {
    const responseTime = Date.now() - startTime.getTime()

    console.error('Cache refresh error:', {
      error: error instanceof Error ? error.message : error,
      responseTime,
      body: req.body,
      timestamp: new Date().toISOString(),
    })

    res.status(500).json({
      success: false,
      error: 'Failed to refresh cache',
      timestamp: new Date(),
    })
  }
})

export default router
