import type { Vehicle } from '../types'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/connection'
import { vehicles } from '../db/schema'

export class VehicleRepository {
  async create(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) {
    const result = await db.insert(vehicles).values({
      vin: vehicleData.vin,
      manufacturer: vehicleData.manufacturer,
      model: vehicleData.model,
      fleetId: vehicleData.fleetId,
      ownerOperator: vehicleData.ownerOperator,
      registrationStatus: vehicleData.registrationStatus,
    }).returning()

    return result[0]
  }

  async findByVin(vin: string) {
    const result = await db.select().from(vehicles).where(eq(vehicles.vin, vin))
    return result[0] || null
  }

  async findAll(filters?: { manufacturer?: string, fleetId?: string, registrationStatus?: string }) {
    if (filters) {
      const conditions = []
      if (filters.manufacturer) {
        conditions.push(eq(vehicles.manufacturer, filters.manufacturer))
      }
      if (filters.fleetId) {
        conditions.push(eq(vehicles.fleetId, filters.fleetId))
      }
      if (filters.registrationStatus) {
        conditions.push(eq(vehicles.registrationStatus, filters.registrationStatus))
      }

      if (conditions.length > 0) {
        return await db.select().from(vehicles).where(and(...conditions))
      }
    }

    return await db.select().from(vehicles)
  }

  async update(vin: string, updates: Partial<Omit<Vehicle, 'id' | 'vin' | 'createdAt' | 'updatedAt'>>) {
    const result = await db.update(vehicles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vehicles.vin, vin))
      .returning()

    return result[0] || null
  }

  async delete(vin: string) {
    const result = await db.delete(vehicles).where(eq(vehicles.vin, vin)).returning()
    return result[0] || null
  }
}
