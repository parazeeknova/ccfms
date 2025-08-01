import type {
  VehicleActivity,
  VehicleDistance,
  VehicleFuelStatus,
} from '../types'
import { and, count, countDistinct, desc, eq, gte, max, min, sql } from 'drizzle-orm'
import { db } from '../db/connection'
import { alerts, telemetry, vehicles } from '../db/schema'
import { ANALYTICS_DEFAULTS } from '../utils/validation'

export class AnalyticsRepository {
  async getActiveVehicleCount(timeWindow: number = ANALYTICS_DEFAULTS.TIME_WINDOW): Promise<number> {
    const cutoffTime = new Date(Date.now() - timeWindow * 60 * 60 * 1000)

    const result = await db
      .select({ count: countDistinct(telemetry.vehicleVin) })
      .from(telemetry)
      .where(gte(telemetry.timestamp, cutoffTime))

    return Number(result[0]?.count || 0)
  }

  async getInactiveVehicleCount(timeWindow: number = ANALYTICS_DEFAULTS.TIME_WINDOW): Promise<number> {
    const totalResult = await db
      .select({ count: count() })
      .from(vehicles)

    const totalVehicles = Number(totalResult[0]?.count || 0)
    const activeCount = await this.getActiveVehicleCount(timeWindow)

    return Math.max(0, totalVehicles - activeCount)
  }

  async getTotalVehicleCount(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(vehicles)

    return Number(result[0]?.count || 0)
  }

  async getAverageFuelLevels(fleetId?: string): Promise<number> {
    const latestTelemetryQuery = db
      .select({
        vehicleVin: telemetry.vehicleVin,
        fuelBatteryLevel: telemetry.fuelBatteryLevel,
        timestamp: telemetry.timestamp,
        rowNumber: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${telemetry.vehicleVin} ORDER BY ${telemetry.timestamp} DESC)`.as('row_number'),
      })
      .from(telemetry)
      .innerJoin(vehicles, eq(telemetry.vehicleVin, vehicles.vin))
      .where(fleetId ? eq(vehicles.fleetId, fleetId) : undefined)
      .as('latest_telemetry')

    const result = await db
      .select({
        avgFuel: sql<number>`AVG(${latestTelemetryQuery.fuelBatteryLevel}::numeric)`,
      })
      .from(latestTelemetryQuery)
      .where(eq(latestTelemetryQuery.rowNumber, 1))

    return Number(result[0]?.avgFuel || 0)
  }

  async getTotalFleetDistance(timeWindow: number = ANALYTICS_DEFAULTS.TIME_WINDOW): Promise<number> {
    const cutoffTime = new Date(Date.now() - timeWindow * 60 * 60 * 1000)

    const distanceQuery = await db
      .select({
        vehicleVin: telemetry.vehicleVin,
        minOdometer: min(telemetry.odometerReading),
        maxOdometer: max(telemetry.odometerReading),
      })
      .from(telemetry)
      .where(gte(telemetry.timestamp, cutoffTime))
      .groupBy(telemetry.vehicleVin)

    let totalDistance = 0
    for (const vehicle of distanceQuery) {
      const minOdo = Number(vehicle.minOdometer || 0)
      const maxOdo = Number(vehicle.maxOdometer || 0)
      totalDistance += Math.max(0, maxOdo - minOdo)
    }

    return Math.round(totalDistance * 100) / 100
  }

  async getAlertCountsByTypeAndSeverity(
    timeWindow: number = ANALYTICS_DEFAULTS.TIME_WINDOW,
  ): Promise<{ byType: Record<string, number>, bySeverity: Record<string, number>, total: number }> {
    const cutoffTime = new Date(Date.now() - timeWindow * 60 * 60 * 1000)

    const typeResults = await db
      .select({
        alertType: alerts.alertType,
        count: count(),
      })
      .from(alerts)
      .where(gte(alerts.createdAt, cutoffTime))
      .groupBy(alerts.alertType)

    const severityResults = await db
      .select({
        severity: alerts.severity,
        count: count(),
      })
      .from(alerts)
      .where(gte(alerts.createdAt, cutoffTime))
      .groupBy(alerts.severity)

    const totalResult = await db
      .select({ count: count() })
      .from(alerts)
      .where(gte(alerts.createdAt, cutoffTime))

    const byType: Record<string, number> = {}
    typeResults.forEach((result) => {
      byType[result.alertType] = Number(result.count)
    })

    const bySeverity: Record<string, number> = {}
    severityResults.forEach((result) => {
      bySeverity[result.severity] = Number(result.count)
    })

    return {
      byType,
      bySeverity,
      total: Number(totalResult[0]?.count || 0),
    }
  }

  async getVehicleActivityDetails(
    timeWindow: number = ANALYTICS_DEFAULTS.TIME_WINDOW,
  ): Promise<VehicleActivity[]> {
    const latestTelemetryQuery = db
      .select({
        vehicleVin: telemetry.vehicleVin,
        timestamp: telemetry.timestamp,
        rowNumber: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${telemetry.vehicleVin} ORDER BY ${telemetry.timestamp} DESC)`.as('row_number'),
      })
      .from(telemetry)
      .as('latest_telemetry')

    const results = await db
      .select({
        vehicleVin: vehicles.vin,
        lastTelemetryTime: latestTelemetryQuery.timestamp,
      })
      .from(vehicles)
      .leftJoin(latestTelemetryQuery, and(
        eq(vehicles.vin, latestTelemetryQuery.vehicleVin),
        eq(latestTelemetryQuery.rowNumber, 1),
      ))

    const now = new Date()
    return results.map((result) => {
      const lastTime = result.lastTelemetryTime
      const hoursInactive = lastTime
        ? (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60)
        : Infinity

      return {
        vehicleVin: result.vehicleVin,
        isActive: hoursInactive < timeWindow,
        lastTelemetryTime: lastTime,
        hoursInactive: Math.round(hoursInactive * 100) / 100,
      }
    })
  }

  async getVehicleDistanceDetails(
    timeWindow: number = ANALYTICS_DEFAULTS.TIME_WINDOW,
  ): Promise<VehicleDistance[]> {
    const cutoffTime = new Date(Date.now() - timeWindow * 60 * 60 * 1000)

    const results = await db
      .select({
        vehicleVin: telemetry.vehicleVin,
        minOdometer: min(telemetry.odometerReading),
        maxOdometer: max(telemetry.odometerReading),
      })
      .from(telemetry)
      .where(gte(telemetry.timestamp, cutoffTime))
      .groupBy(telemetry.vehicleVin)

    return results.map((result) => {
      const startOdometer = Number(result.minOdometer || 0)
      const endOdometer = Number(result.maxOdometer || 0)
      const distanceTraveled = Math.max(0, endOdometer - startOdometer)

      return {
        vehicleVin: result.vehicleVin,
        startOdometer,
        endOdometer,
        distanceTraveled,
        timeWindow,
      }
    })
  }

  async getVehicleFuelStatus(
    lowThreshold: number = ANALYTICS_DEFAULTS.LOW_FUEL_THRESHOLD,
    criticalThreshold: number = ANALYTICS_DEFAULTS.CRITICAL_FUEL_THRESHOLD,
  ): Promise<VehicleFuelStatus[]> {
    const latestTelemetryQuery = db
      .select({
        vehicleVin: telemetry.vehicleVin,
        fuelBatteryLevel: telemetry.fuelBatteryLevel,
        timestamp: telemetry.timestamp,
        rowNumber: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${telemetry.vehicleVin} ORDER BY ${telemetry.timestamp} DESC)`.as('row_number'),
      })
      .from(telemetry)
      .as('latest_telemetry')

    const results = await db
      .select({
        vehicleVin: latestTelemetryQuery.vehicleVin,
        fuelBatteryLevel: latestTelemetryQuery.fuelBatteryLevel,
        timestamp: latestTelemetryQuery.timestamp,
      })
      .from(latestTelemetryQuery)
      .where(eq(latestTelemetryQuery.rowNumber, 1))

    return results.map((result) => {
      const fuelLevel = Number(result.fuelBatteryLevel)

      return {
        vehicleVin: result.vehicleVin,
        currentFuelLevel: fuelLevel,
        lastUpdated: result.timestamp,
        isLowFuel: fuelLevel <= lowThreshold,
        isCriticalFuel: fuelLevel <= criticalThreshold,
      }
    })
  }

  async getFleetAnalyticsByFleetId(
    fleetId?: string,
    timeWindow: number = ANALYTICS_DEFAULTS.TIME_WINDOW,
  ): Promise<{
    activeVehicles: number
    inactiveVehicles: number
    totalVehicles: number
    averageFuelLevel: number
  }> {
    const cutoffTime = new Date(Date.now() - timeWindow * 60 * 60 * 1000)

    const totalResult = await db
      .select({ count: count() })
      .from(vehicles)
      .where(fleetId ? eq(vehicles.fleetId, fleetId) : undefined)

    const totalVehicles = Number(totalResult[0]?.count || 0)

    const activeResult = await db
      .select({ count: countDistinct(telemetry.vehicleVin) })
      .from(telemetry)
      .innerJoin(vehicles, eq(telemetry.vehicleVin, vehicles.vin))
      .where(
        and(
          gte(telemetry.timestamp, cutoffTime),
          fleetId ? eq(vehicles.fleetId, fleetId) : undefined,
        ),
      )

    const activeVehicles = Number(activeResult[0]?.count || 0)
    const inactiveVehicles = Math.max(0, totalVehicles - activeVehicles)

    const averageFuelLevel = await this.getAverageFuelLevels(fleetId)

    return {
      activeVehicles,
      inactiveVehicles,
      totalVehicles,
      averageFuelLevel,
    }
  }

  async getRecentTelemetryData(
    timeWindow: number = ANALYTICS_DEFAULTS.TIME_WINDOW,
    fleetId?: string,
  ): Promise<any[]> {
    const cutoffTime = new Date(Date.now() - timeWindow * 60 * 60 * 1000)

    return await db
      .select({
        id: telemetry.id,
        vehicleVin: telemetry.vehicleVin,
        latitude: telemetry.latitude,
        longitude: telemetry.longitude,
        speed: telemetry.speed,
        engineStatus: telemetry.engineStatus,
        fuelBatteryLevel: telemetry.fuelBatteryLevel,
        odometerReading: telemetry.odometerReading,
        diagnosticCodes: telemetry.diagnosticCodes,
        timestamp: telemetry.timestamp,
        createdAt: telemetry.createdAt,
      })
      .from(telemetry)
      .innerJoin(vehicles, eq(telemetry.vehicleVin, vehicles.vin))
      .where(
        and(
          gte(telemetry.timestamp, cutoffTime),
          fleetId ? eq(vehicles.fleetId, fleetId) : undefined,
        ),
      )
      .orderBy(desc(telemetry.timestamp))
  }

  async getRecentAlerts(
    timeWindow: number = ANALYTICS_DEFAULTS.TIME_WINDOW,
    fleetId?: string,
  ): Promise<any[]> {
    const cutoffTime = new Date(Date.now() - timeWindow * 60 * 60 * 1000)

    return await db
      .select({
        id: alerts.id,
        vehicleVin: alerts.vehicleVin,
        telemetryId: alerts.telemetryId,
        alertType: alerts.alertType,
        severity: alerts.severity,
        message: alerts.message,
        resolved: alerts.resolved,
        createdAt: alerts.createdAt,
        resolvedAt: alerts.resolvedAt,
      })
      .from(alerts)
      .innerJoin(vehicles, eq(alerts.vehicleVin, vehicles.vin))
      .where(
        and(
          gte(alerts.createdAt, cutoffTime),
          fleetId ? eq(vehicles.fleetId, fleetId) : undefined,
        ),
      )
      .orderBy(desc(alerts.createdAt))
  }
}
