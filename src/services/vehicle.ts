import type { Vehicle } from '../types'
import { VehicleRepository } from '../repositories/vehicle'

export class VehicleService {
  private vehicleRepo: VehicleRepository

  constructor() {
    this.vehicleRepo = new VehicleRepository()
  }

  async createVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) {
    const existing = await this.vehicleRepo.findByVin(vehicleData.vin)
    if (existing) {
      throw new Error('vehicle VIN already exists')
    }

    const validStatuses = ['Active', 'Maintenance', 'Decommissioned']
    if (!validStatuses.includes(vehicleData.registrationStatus)) {
      throw new Error('invalid registration')
    }

    return await this.vehicleRepo.create(vehicleData)
  }

  async getVehicleByVin(vin: string) {
    if (!vin) {
      throw new Error('invalid VIN format')
    }

    const vehicle = await this.vehicleRepo.findByVin(vin)
    if (!vehicle) {
      throw new Error('vehicle not found')
    }

    return vehicle
  }

  async getAllVehicles(filters?: { manufacturer?: string, fleetId?: string, registrationStatus?: string }) {
    return await this.vehicleRepo.findAll(filters)
  }

  async updateVehicle(vin: string, updates: Partial<Omit<Vehicle, 'id' | 'vin' | 'createdAt' | 'updatedAt'>>) {
    const existing = await this.vehicleRepo.findByVin(vin)
    if (!existing) {
      throw new Error('vehicle not found')
    }

    if (updates.registrationStatus) {
      const validStatuses = ['Active', 'Maintenance', 'Decommissioned']
      if (!validStatuses.includes(updates.registrationStatus)) {
        throw new Error('invalid registration')
      }
    }

    return await this.vehicleRepo.update(vin, updates)
  }

  async deleteVehicle(vin: string) {
    const existing = await this.vehicleRepo.findByVin(vin)
    if (!existing) {
      throw new Error('vehicle not found')
    }

    return await this.vehicleRepo.delete(vin)
  }
}
