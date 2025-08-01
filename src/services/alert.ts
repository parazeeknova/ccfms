import type { Alert } from '../types'
import { AlertRepository } from '../repositories/alerts'
import { VehicleRepository } from '../repositories/vehicle'

export class AlertService {
  private alertRepo: AlertRepository
  private vehicleRepo: VehicleRepository

  constructor() {
    this.alertRepo = new AlertRepository()
    this.vehicleRepo = new VehicleRepository()
  }

  async createAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'resolvedAt'>) {
    const vehicle = await this.vehicleRepo.findByVin(alertData.vehicleVin)
    if (!vehicle) {
      throw new Error('vehicle not found')
    }

    const validSeverities = ['Low', 'Medium', 'High', 'Critical']
    if (!validSeverities.includes(alertData.severity)) {
      throw new Error('invalid severity level')
    }

    if (!alertData.alertType || !alertData.message) {
      throw new Error('alert type and message are required')
    }

    return await this.alertRepo.create(alertData)
  }

  async getAlertById(id: number) {
    if (!id || id <= 0) {
      throw new Error('invalid alert ID')
    }

    const alert = await this.alertRepo.findById(id)
    if (!alert) {
      throw new Error('alert not found')
    }

    return alert
  }

  async getAlertCount(filters: {
    vehicleVin?: string
    alertType?: string
    severity?: string
    resolved?: boolean
    startTime?: string
    endTime?: string
  }) {
    const processedFilters: any = {}

    if (filters.vehicleVin) {
      const vehicle = await this.vehicleRepo.findByVin(filters.vehicleVin)
      if (!vehicle) {
        throw new Error('vehicle not found')
      }
      processedFilters.vehicleVin = filters.vehicleVin
    }

    if (filters.alertType) {
      processedFilters.alertType = filters.alertType
    }

    if (filters.severity) {
      const validSeverities = ['Low', 'Medium', 'High', 'Critical']
      if (!validSeverities.includes(filters.severity)) {
        throw new Error('invalid severity level')
      }
      processedFilters.severity = filters.severity
    }

    if (filters.resolved !== undefined) {
      processedFilters.resolved = filters.resolved
    }

    if (filters.startTime) {
      const startDate = new Date(filters.startTime)
      if (Number.isNaN(startDate.getTime())) {
        throw new TypeError('invalid startTime format')
      }
      processedFilters.startTime = startDate
    }

    if (filters.endTime) {
      const endDate = new Date(filters.endTime)
      if (Number.isNaN(endDate.getTime())) {
        throw new TypeError('invalid endTime format')
      }
      processedFilters.endTime = endDate
    }

    return await this.alertRepo.countByFilters(processedFilters)
  }
}
