import type {
  ActivityQueryParams,
  ActivityStatus,
  AlertSummary,
  AlertSummaryQueryParams,
  AnalyticsQueryParams,
  DistanceAnalytics,
  FleetAnalytics,
  FuelAnalytics,
  VehicleActivity,
  VehicleDistance,
  VehicleFuelStatus,
} from '../types'
import { AnalyticsRepository } from '../repositories/analytics'
import { ANALYTICS_DEFAULTS } from '../utils/validation'

export class AnalyticsService {
  private analyticsRepo: AnalyticsRepository
  private cache: Map<string, { data: any, timestamp: number, ttl: number }>

  constructor() {
    this.analyticsRepo = new AnalyticsRepository()
    this.cache = new Map()
  }

  async getFleetAnalytics(params: AnalyticsQueryParams = {}): Promise<FleetAnalytics> {
    const startTime = new Date()
    const timeWindow = params.timeWindow || ANALYTICS_DEFAULTS.TIME_WINDOW
    const cacheKey = `fleet_analytics_${params.fleetId || 'all'}_${timeWindow}`

    try {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached as FleetAnalytics
      }

      const fleetMetrics = await this.analyticsRepo.getFleetAnalyticsByFleetId(params.fleetId, timeWindow)
      const totalDistance = await this.analyticsRepo.getTotalFleetDistance(timeWindow)

      const alertSummary = await this.getAlertSummary({
        ...params,
        timeWindow,
      })

      const fleetAnalytics: FleetAnalytics = {
        activeVehicles: fleetMetrics.activeVehicles,
        inactiveVehicles: fleetMetrics.inactiveVehicles,
        totalVehicles: fleetMetrics.totalVehicles,
        averageFuelLevel: Math.round(fleetMetrics.averageFuelLevel * 100) / 100,
        totalDistanceLast24h: totalDistance,
        alertSummary,
        lastUpdated: new Date(),
      }

      this.setCache(cacheKey, fleetAnalytics, ANALYTICS_DEFAULTS.CACHE_TTL)

      return fleetAnalytics
    }
    catch (error) {
      this.handleError('getFleetAnalytics', error, startTime)
      throw new Error('Failed to retrieve fleet analytics')
    }
  }

  async getVehicleActivityStatus(params: ActivityQueryParams = {}): Promise<ActivityStatus> {
    const startTime = new Date()
    const timeWindow = params.timeWindow || ANALYTICS_DEFAULTS.TIME_WINDOW
    const inactiveThreshold = params.inactiveThreshold || ANALYTICS_DEFAULTS.INACTIVE_THRESHOLD
    const cacheKey = `activity_status_${params.fleetId || 'all'}_${timeWindow}_${inactiveThreshold}`

    try {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached as ActivityStatus
      }

      const fleetMetrics = await this.analyticsRepo.getFleetAnalyticsByFleetId(params.fleetId, inactiveThreshold)

      const activityStatus: ActivityStatus = {
        active: fleetMetrics.activeVehicles,
        inactive: fleetMetrics.inactiveVehicles,
        inactiveThreshold,
      }
      this.setCache(cacheKey, activityStatus, ANALYTICS_DEFAULTS.CACHE_TTL)

      return activityStatus
    }
    catch (error) {
      this.handleError('getVehicleActivityStatus', error, startTime)
      throw new Error('Failed to retrieve vehicle activity status')
    }
  }

  async getFleetFuelAnalytics(params: AnalyticsQueryParams = {}): Promise<FuelAnalytics> {
    const startTime = new Date()
    const cacheKey = `fuel_analytics_${params.fleetId || 'all'}`

    try {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached as FuelAnalytics
      }

      const averageFuelLevel = await this.analyticsRepo.getAverageFuelLevels(params.fleetId)
      const fuelStatuses = await this.analyticsRepo.getVehicleFuelStatus()

      let filteredStatuses = fuelStatuses
      if (params.fleetId) {
        // We would need to join with vehicles table to filter by fleet
        // For now, we'll get all and let the repository handle fleet filtering
        filteredStatuses = fuelStatuses
      }

      const lowFuelVehicles = filteredStatuses.filter(status => status.isLowFuel).length
      const criticalFuelVehicles = filteredStatuses.filter(status => status.isCriticalFuel).length

      const fuelAnalytics: FuelAnalytics = {
        averageFuelLevel: Math.round(averageFuelLevel * 100) / 100,
        lowFuelVehicles,
        criticalFuelVehicles,
        fleetId: params.fleetId,
        lastUpdated: new Date(),
      }

      this.setCache(cacheKey, fuelAnalytics, ANALYTICS_DEFAULTS.CACHE_TTL)

      return fuelAnalytics
    }
    catch (error) {
      this.handleError('getFleetFuelAnalytics', error, startTime)
      throw new Error('Failed to retrieve fuel analytics')
    }
  }

  async getFleetDistanceAnalytics(params: AnalyticsQueryParams = {}): Promise<DistanceAnalytics> {
    const startTime = new Date()
    const timeWindow = params.timeWindow || ANALYTICS_DEFAULTS.TIME_WINDOW
    const cacheKey = `distance_analytics_${params.fleetId || 'all'}_${timeWindow}`

    try {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached as DistanceAnalytics
      }

      const totalDistance = await this.analyticsRepo.getTotalFleetDistance(timeWindow)
      const vehicleDistances = await this.analyticsRepo.getVehicleDistanceDetails(timeWindow)
      const vehicleCount = vehicleDistances.length
      const averageDistancePerVehicle = vehicleCount > 0
        ? Math.round((totalDistance / vehicleCount) * 100) / 100
        : 0

      const distanceAnalytics: DistanceAnalytics = {
        totalDistance,
        averageDistancePerVehicle,
        timeWindow,
        vehicleCount,
        fleetId: params.fleetId,
        lastUpdated: new Date(),
      }

      this.setCache(cacheKey, distanceAnalytics, ANALYTICS_DEFAULTS.CACHE_TTL)

      return distanceAnalytics
    }
    catch (error) {
      this.handleError('getFleetDistanceAnalytics', error, startTime)
      throw new Error('Failed to retrieve distance analytics')
    }
  }

  async getAlertSummary(params: AlertSummaryQueryParams = {}): Promise<AlertSummary> {
    const startTime = new Date()
    const timeWindow = params.timeWindow || ANALYTICS_DEFAULTS.TIME_WINDOW
    const cacheKey = `alert_summary_${params.fleetId || 'all'}_${timeWindow}_${params.resolved || 'all'}`

    try {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached as AlertSummary
      }

      const alertCounts = await this.analyticsRepo.getAlertCountsByTypeAndSeverity(timeWindow)

      const alertSummary: AlertSummary = {
        byType: alertCounts.byType,
        bySeverity: alertCounts.bySeverity,
        total: alertCounts.total,
        timeWindow,
        lastUpdated: new Date(),
      }

      this.setCache(cacheKey, alertSummary, ANALYTICS_DEFAULTS.CACHE_TTL)

      return alertSummary
    }
    catch (error) {
      this.handleError('getAlertSummary', error, startTime)
      throw new Error('Failed to retrieve alert summary')
    }
  }

  async getDetailedVehicleActivity(params: ActivityQueryParams = {}): Promise<VehicleActivity[]> {
    const startTime = new Date()
    const timeWindow = params.timeWindow || ANALYTICS_DEFAULTS.TIME_WINDOW

    try {
      const activities = await this.analyticsRepo.getVehicleActivityDetails(timeWindow)

      if (params.fleetId) {
        // Filter would need to be applied at repository level for efficiency
        // For now, return all activities
      }

      return activities
    }
    catch (error) {
      this.handleError('getDetailedVehicleActivity', error, startTime)
      throw new Error('Failed to retrieve detailed vehicle activity')
    }
  }

  async getDetailedVehicleDistances(params: AnalyticsQueryParams = {}): Promise<VehicleDistance[]> {
    const startTime = new Date()
    const timeWindow = params.timeWindow || ANALYTICS_DEFAULTS.TIME_WINDOW

    try {
      return await this.analyticsRepo.getVehicleDistanceDetails(timeWindow)
    }
    catch (error) {
      this.handleError('getDetailedVehicleDistances', error, startTime)
      throw new Error('Failed to retrieve detailed vehicle distances')
    }
  }

  async getDetailedFuelStatus(): Promise<VehicleFuelStatus[]> {
    const startTime = new Date()

    try {
      return await this.analyticsRepo.getVehicleFuelStatus()
    }
    catch (error) {
      this.handleError('getDetailedFuelStatus', error, startTime)
      throw new Error('Failed to retrieve detailed fuel status')
    }
  }

  async refreshCache(fleetId?: string): Promise<void> {
    try {
      const keysToDelete = Array.from(this.cache.keys()).filter(key =>
        !fleetId || key.includes(fleetId) || key.includes('all'),
      )

      keysToDelete.forEach(key => this.cache.delete(key))

      await Promise.all([
        this.getFleetAnalytics({ fleetId }),
        this.getVehicleActivityStatus({ fleetId }),
        this.getFleetFuelAnalytics({ fleetId }),
        this.getFleetDistanceAnalytics({ fleetId }),
        this.getAlertSummary({ fleetId }),
      ])
    }
    catch (error) {
      console.error('Failed to refresh analytics cache:', error)
      // Don't throw error for cache refresh failures
    }
  }

  async getAnalyticsHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    cacheSize: number
    lastUpdate: Date
    responseTime?: number
  }> {
    const startTime = new Date()

    try {
      await this.analyticsRepo.getTotalVehicleCount()

      const responseTime = Date.now() - startTime.getTime()

      return {
        status: responseTime < 500 ? 'healthy' : responseTime < 2000 ? 'degraded' : 'unhealthy',
        cacheSize: this.cache.size,
        lastUpdate: new Date(),
        responseTime,
      }
    }
    catch {
      return {
        status: 'unhealthy',
        cacheSize: this.cache.size,
        lastUpdate: new Date(),
      }
    }
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached)
      return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl * 1000) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  private setCache(key: string, data: any, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds,
    })

    if (this.cache.size > 100) {
      this.cleanupExpiredCache()
    }
  }

  private cleanupExpiredCache(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl * 1000) {
        this.cache.delete(key)
      }
    }
  }

  private handleError(method: string, error: any, startTime: Date): void {
    const responseTime = Date.now() - startTime.getTime()

    console.error(`AnalyticsService.${method} failed:`, {
      error: error.message || error,
      responseTime,
      timestamp: new Date().toISOString(),
    })

    // In production, you might want to send this to a monitoring service
    // this.sendToMonitoring(method, error, responseTime)
  }

  private validateTimeWindow(timeWindow?: number): number {
    if (!timeWindow)
      return ANALYTICS_DEFAULTS.TIME_WINDOW

    if (timeWindow <= 0 || timeWindow > ANALYTICS_DEFAULTS.MAX_TIME_WINDOW) {
      throw new Error(`Time window must be between 1 and ${ANALYTICS_DEFAULTS.MAX_TIME_WINDOW} hours`)
    }

    return timeWindow
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheStats(): {
    size: number
    keys: string[]
    oldestEntry?: Date
    newestEntry?: Date
  } {
    const keys = Array.from(this.cache.keys())
    const timestamps = Array.from(this.cache.values()).map(v => v.timestamp)

    return {
      size: this.cache.size,
      keys,
      oldestEntry: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : undefined,
      newestEntry: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : undefined,
    }
  }
}
