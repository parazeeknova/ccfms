import type {
  Alert,
  AlertSummary,
  TelemetryData,
  VehicleActivity,
  VehicleDistance,
  VehicleFuelStatus,
} from '../types'
import { ANALYTICS_DEFAULTS } from './validation'

export class AnalyticsCalculator {
  static calculateVehicleActivity(
    telemetryData: TelemetryData[],
    inactiveThreshold: number = ANALYTICS_DEFAULTS.INACTIVE_THRESHOLD,
  ): VehicleActivity[] {
    const vehicleMap = new Map<string, TelemetryData>()
    const now = new Date()

    telemetryData.forEach((data) => {
      const existing = vehicleMap.get(data.vehicleVin)
      if (!existing || data.timestamp > existing.timestamp) {
        vehicleMap.set(data.vehicleVin, data)
      }
    })

    return Array.from(vehicleMap.entries()).map(([vin, latestData]) => {
      const hoursInactive = (now.getTime() - latestData.timestamp.getTime()) / (1000 * 60 * 60)

      return {
        vehicleVin: vin,
        isActive: hoursInactive < inactiveThreshold,
        lastTelemetryTime: latestData.timestamp,
        hoursInactive: Math.round(hoursInactive * 100) / 100,
      }
    })
  }

  static calculateVehicleDistances(
    telemetryData: TelemetryData[],
    timeWindow: number = ANALYTICS_DEFAULTS.TIME_WINDOW,
  ): VehicleDistance[] {
    const vehicleMap = new Map<string, TelemetryData[]>()
    const cutoffTime = new Date(Date.now() - timeWindow * 60 * 60 * 1000)

    telemetryData
      .filter(data => data.timestamp >= cutoffTime)
      .forEach((data) => {
        if (!vehicleMap.has(data.vehicleVin)) {
          vehicleMap.set(data.vehicleVin, [])
        }
        vehicleMap.get(data.vehicleVin)!.push(data)
      })

    return Array.from(vehicleMap.entries()).map(([vin, vehicleData]) => {
      vehicleData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

      const startOdometer = vehicleData[0]?.odometerReading || 0
      const endOdometer = vehicleData[vehicleData.length - 1]?.odometerReading || 0
      const distanceTraveled = Math.max(0, endOdometer - startOdometer)

      return {
        vehicleVin: vin,
        startOdometer,
        endOdometer,
        distanceTraveled,
        timeWindow,
      }
    })
  }

  static calculateFuelStatus(
    telemetryData: TelemetryData[],
    lowThreshold: number = ANALYTICS_DEFAULTS.LOW_FUEL_THRESHOLD,
    criticalThreshold: number = ANALYTICS_DEFAULTS.CRITICAL_FUEL_THRESHOLD,
  ): VehicleFuelStatus[] {
    const vehicleMap = new Map<string, TelemetryData>()

    telemetryData.forEach((data) => {
      const existing = vehicleMap.get(data.vehicleVin)
      if (!existing || data.timestamp > existing.timestamp) {
        vehicleMap.set(data.vehicleVin, data)
      }
    })

    return Array.from(vehicleMap.entries()).map(([vin, latestData]) => ({
      vehicleVin: vin,
      currentFuelLevel: latestData.fuelBatteryLevel,
      lastUpdated: latestData.timestamp,
      isLowFuel: latestData.fuelBatteryLevel <= lowThreshold,
      isCriticalFuel: latestData.fuelBatteryLevel <= criticalThreshold,
    }))
  }

  static calculateAverageFuelLevel(fuelStatuses: VehicleFuelStatus[]): number {
    if (fuelStatuses.length === 0)
      return 0

    const totalFuel = fuelStatuses.reduce((sum, status) => sum + status.currentFuelLevel, 0)
    return Math.round((totalFuel / fuelStatuses.length) * 100) / 100
  }

  static calculateTotalFleetDistance(vehicleDistances: VehicleDistance[]): number {
    const totalDistance = vehicleDistances.reduce((sum, vehicle) => sum + vehicle.distanceTraveled, 0)
    return Math.round(totalDistance * 100) / 100
  }

  static generateAlertSummary(
    alerts: Alert[],
    timeWindow: number = ANALYTICS_DEFAULTS.TIME_WINDOW,
  ): AlertSummary {
    const cutoffTime = new Date(Date.now() - timeWindow * 60 * 60 * 1000)
    const recentAlerts = alerts.filter(alert => alert.createdAt >= cutoffTime)

    const byType: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}

    recentAlerts.forEach((alert) => {
      byType[alert.alertType] = (byType[alert.alertType] || 0) + 1
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1
    })

    return {
      byType,
      bySeverity,
      total: recentAlerts.length,
      timeWindow,
      lastUpdated: new Date(),
    }
  }

  static isVehicleActive(
    lastTelemetryTime: Date | null,
    inactiveThreshold: number = ANALYTICS_DEFAULTS.INACTIVE_THRESHOLD,
  ): boolean {
    if (!lastTelemetryTime)
      return false

    const hoursInactive = (Date.now() - lastTelemetryTime.getTime()) / (1000 * 60 * 60)
    return hoursInactive < inactiveThreshold
  }

  static formatAnalyticsResponse<T>(data: T, message?: string): {
    data: T
    success: boolean
    message?: string
    timestamp: Date
  } {
    return {
      data,
      success: true,
      message,
      timestamp: new Date(),
    }
  }

  static calculatePerformanceMetrics(startTime: Date): {
    responseTime: number
    timestamp: Date
  } {
    const responseTime = Date.now() - startTime.getTime()
    return {
      responseTime,
      timestamp: new Date(),
    }
  }
}

export class DataAggregator {
  static groupBy<T, K extends keyof T>(array: T[], key: K): Map<T[K], T[]> {
    return array.reduce((map, item) => {
      const groupKey = item[key]
      if (!map.has(groupKey)) {
        map.set(groupKey, [])
      }
      map.get(groupKey)!.push(item)
      return map
    }, new Map<T[K], T[]>())
  }

  static calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0)
      return 0

    const sorted = [...values].sort((a, b) => a - b)
    const index = (percentile / 100) * (sorted.length - 1)

    if (Number.isInteger(index)) {
      return sorted[index] || 0
    }

    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index - lower

    return (sorted[lower] || 0) * (1 - weight) + (sorted[upper] || 0) * weight
  }

  static calculateMovingAverage(values: number[], windowSize: number): number[] {
    if (values.length < windowSize)
      return values

    const result: number[] = []
    for (let i = windowSize - 1; i < values.length; i++) {
      const window = values.slice(i - windowSize + 1, i + 1)
      const average = window.reduce((sum, val) => sum + val, 0) / windowSize
      result.push(Math.round(average * 100) / 100)
    }

    return result
  }
}
