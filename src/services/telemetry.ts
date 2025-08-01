import type { TelemetryData } from '../types'
import { TelemetryRepository } from '../repositories/telemetry'

export class TelemetryService {
  private telemetryRepo: TelemetryRepository

  constructor() {
    this.telemetryRepo = new TelemetryRepository()
  }

  async createTelemetryData(telemetryData: Omit<TelemetryData, 'id' | 'createdAt'>) {
    this.validateGpsCoordinates(telemetryData.latitude, telemetryData.longitude)
    this.validateTelemetryRanges(telemetryData)
    this.validateEngineStatus(telemetryData.engineStatus)

    return await this.telemetryRepo.create(telemetryData)
  }

  async getTelemetryHistory(
    vehicleVin: string,
    startTime?: Date,
    endTime?: Date,
  ) {
    if (!vehicleVin || vehicleVin.trim().length === 0) {
      throw new Error('vehicle VIN is required')
    }

    if (startTime && endTime && startTime >= endTime) {
      throw new Error('start time must be before end time')
    }

    return await this.telemetryRepo.findByVinWithTimeRange(vehicleVin, startTime, endTime)
  }

  async getLatestTelemetry(vehicleVin: string) {
    if (!vehicleVin || vehicleVin.trim().length === 0) {
      throw new Error('vehicle VIN is required')
    }

    const result = await this.telemetryRepo.findLatestByVin(vehicleVin)
    if (!result) {
      throw new Error('no telemetry data found for vehicle')
    }

    return result
  }

  private validateGpsCoordinates(latitude: number, longitude: number) {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new TypeError('GPS coordinates must be numbers')
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error('latitude must be between -90 and 90 degrees')
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error('longitude must be between -180 and 180 degrees')
    }
  }

  private validateTelemetryRanges(data: Omit<TelemetryData, 'id' | 'createdAt'>) {
    if (typeof data.speed !== 'number' || data.speed < 0) {
      throw new Error('speed must be a non-negative number')
    }
    if (data.speed > 300) {
      throw new Error('speed value seems unrealistic')
    }

    if (typeof data.fuelBatteryLevel !== 'number' || data.fuelBatteryLevel < 0 || data.fuelBatteryLevel > 100) {
      throw new Error('fuel/battery level must be between 0 and 100')
    }

    if (typeof data.odometerReading !== 'number' || data.odometerReading < 0) {
      throw new Error('odometer reading must be a non-negative number')
    }

    if (!(data.timestamp instanceof Date) || Number.isNaN(data.timestamp.getTime())) {
      throw new TypeError('timestamp must be a valid date')
    }
  }

  private validateEngineStatus(engineStatus: string) {
    const validStatuses = ['On', 'Off', 'Idle']
    if (!validStatuses.includes(engineStatus)) {
      throw new Error(`engine status must be one of: ${validStatuses.join(', ')}`)
    }
  }
}
