import type { Alert } from '../types'
import { and, count, eq, gte, lte } from 'drizzle-orm'
import { db } from '../db/connection'
import { alerts } from '../db/schema'

export class AlertRepository {
  async create(alertData: Omit<Alert, 'id' | 'createdAt' | 'resolvedAt'>) {
    const result = await db.insert(alerts).values({
      vehicleVin: alertData.vehicleVin,
      telemetryId: alertData.telemetryId || null,
      alertType: alertData.alertType,
      severity: alertData.severity,
      message: alertData.message,
      resolved: alertData.resolved,
    }).returning()

    return result[0]
  }

  async findById(id: number) {
    const result = await db
      .select()
      .from(alerts)
      .where(eq(alerts.id, id))
      .limit(1)

    return result[0] || null
  }

  async resolve(id: number) {
    const result = await db
      .update(alerts)
      .set({
        resolved: true,
        resolvedAt: new Date(),
      })
      .where(eq(alerts.id, id))
      .returning()

    return result[0] || null
  }

  async countByFilters(filters: {
    vehicleVin?: string
    alertType?: string
    severity?: string
    resolved?: boolean
    startTime?: Date
    endTime?: Date
  }): Promise<number> {
    const conditions = []

    if (filters.vehicleVin) {
      conditions.push(eq(alerts.vehicleVin, filters.vehicleVin))
    }
    if (filters.alertType) {
      conditions.push(eq(alerts.alertType, filters.alertType))
    }
    if (filters.severity) {
      conditions.push(eq(alerts.severity, filters.severity))
    }
    if (filters.resolved !== undefined) {
      conditions.push(eq(alerts.resolved, filters.resolved))
    }
    if (filters.startTime) {
      conditions.push(gte(alerts.createdAt, filters.startTime))
    }
    if (filters.endTime) {
      conditions.push(lte(alerts.createdAt, filters.endTime))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const result = await db
      .select({ count: count() })
      .from(alerts)
      .where(whereClause)

    return Number(result[0]?.count)
  }
}
