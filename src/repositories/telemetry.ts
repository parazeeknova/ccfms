import type { TelemetryData } from '../types'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { db } from '../db/connection'
import { telemetry } from '../db/schema'

export class TelemetryRepository {
  async create(telemetryData: Omit<TelemetryData, 'id' | 'createdAt'>) {
    const result = await db.insert(telemetry).values({
      vehicleVin: telemetryData.vehicleVin,
      latitude: telemetryData.latitude.toString(),
      longitude: telemetryData.longitude.toString(),
      speed: telemetryData.speed.toString(),
      engineStatus: telemetryData.engineStatus,
      fuelBatteryLevel: telemetryData.fuelBatteryLevel.toString(),
      odometerReading: telemetryData.odometerReading.toString(),
      diagnosticCodes: telemetryData.diagnosticCodes || null,
      timestamp: telemetryData.timestamp,
    }).returning()

    return result[0]
  }

  async createBatch(telemetryDataArray: Array<Omit<TelemetryData, 'id' | 'createdAt'>>) {
    if (telemetryDataArray.length === 0) {
      return []
    }

    const values = telemetryDataArray.map(data => ({
      vehicleVin: data.vehicleVin,
      latitude: data.latitude.toString(),
      longitude: data.longitude.toString(),
      speed: data.speed.toString(),
      engineStatus: data.engineStatus,
      fuelBatteryLevel: data.fuelBatteryLevel.toString(),
      odometerReading: data.odometerReading.toString(),
      diagnosticCodes: data.diagnosticCodes || null,
      timestamp: data.timestamp,
    }))

    const result = await db.insert(telemetry).values(values).returning()
    return result
  }

  async findByVinWithTimeRange(
    vehicleVin: string,
    startTime?: Date,
    endTime?: Date,
  ) {
    const conditions = [eq(telemetry.vehicleVin, vehicleVin)]

    if (startTime) {
      conditions.push(gte(telemetry.timestamp, startTime))
    }
    if (endTime) {
      conditions.push(lte(telemetry.timestamp, endTime))
    }

    return await db
      .select()
      .from(telemetry)
      .where(and(...conditions))
      .orderBy(desc(telemetry.timestamp))
  }

  async findLatestByVin(vehicleVin: string) {
    const result = await db
      .select()
      .from(telemetry)
      .where(eq(telemetry.vehicleVin, vehicleVin))
      .orderBy(desc(telemetry.timestamp))
      .limit(1)

    return result[0] || null
  }

  async findLatestByVins(vehicleVins: string[]) {
    if (vehicleVins.length === 0) {
      return []
    }

    const promises = vehicleVins.map(vin => this.findLatestByVin(vin))
    const results = await Promise.all(promises)

    return results.filter(result => result !== null)
  }
}
