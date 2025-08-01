import { boolean, decimal, index, integer, jsonb, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  vin: varchar('vin', { length: 10 }).notNull().unique(),
  manufacturer: varchar('manufacturer', { length: 50 }).notNull(),
  model: varchar('model', { length: 50 }).notNull(),
  fleetId: varchar('fleet_id', { length: 50 }).notNull(),
  ownerOperator: jsonb('owner_operator').notNull(),
  registrationStatus: varchar('registration_status', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, table => ({
  fleetIdIdx: index('vehicles_fleet_id_idx').on(table.fleetId),
  registrationStatusIdx: index('vehicles_registration_status_idx').on(table.registrationStatus),
}))

export const telemetry = pgTable('telemetry', {
  id: serial('id').primaryKey(),
  vehicleVin: varchar('vehicle_vin', { length: 10 }).notNull().references(() => vehicles.vin),
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
  speed: decimal('speed', { precision: 5, scale: 2 }).notNull(),
  engineStatus: varchar('engine_status', { length: 10 }).notNull(),
  fuelBatteryLevel: decimal('fuel_battery_level', { precision: 5, scale: 2 }).notNull(),
  odometerReading: decimal('odometer_reading', { precision: 10, scale: 2 }).notNull(),
  diagnosticCodes: jsonb('diagnostic_codes'),
  timestamp: timestamp('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, table => ({
  vinTimestampIdx: index('telemetry_vin_timestamp_idx').on(table.vehicleVin, table.timestamp),
  timestampIdx: index('telemetry_timestamp_idx').on(table.timestamp),
  vinTimestampDescIdx: index('telemetry_vin_timestamp_desc_idx').on(table.vehicleVin, table.timestamp.desc()),
  recentTimestampIdx: index('telemetry_recent_timestamp_idx').on(table.timestamp.desc()),
  fuelLevelIdx: index('telemetry_fuel_level_idx').on(table.fuelBatteryLevel),
  speedIdx: index('telemetry_speed_idx').on(table.speed),
  odometerTimestampIdx: index('telemetry_odometer_timestamp_idx').on(table.vehicleVin, table.odometerReading, table.timestamp.desc()),
}))

export const alerts = pgTable('alerts', {
  id: serial('id').primaryKey(),
  vehicleVin: varchar('vehicle_vin', { length: 10 }).notNull().references(() => vehicles.vin),
  telemetryId: integer('telemetry_id').references(() => telemetry.id),
  alertType: varchar('alert_type', { length: 50 }).notNull(),
  severity: varchar('severity', { length: 20 }).notNull(),
  message: text('message').notNull(),
  resolved: boolean('resolved').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
}, table => ({
  vinTypeIdx: index('alerts_vin_type_idx').on(table.vehicleVin, table.alertType),
  severityIdx: index('alerts_severity_idx').on(table.severity),
  resolvedIdx: index('alerts_resolved_idx').on(table.resolved),
  createdAtIdx: index('alerts_created_at_idx').on(table.createdAt),
  typeCreatedAtIdx: index('alerts_type_created_at_idx').on(table.alertType, table.createdAt.desc()),
  severityCreatedAtIdx: index('alerts_severity_created_at_idx').on(table.severity, table.createdAt.desc()),
  resolvedCreatedAtIdx: index('alerts_resolved_created_at_idx').on(table.resolved, table.createdAt.desc()),
  typeSeverityIdx: index('alerts_type_severity_idx').on(table.alertType, table.severity),
  recentAlertsIdx: index('alerts_recent_idx').on(table.createdAt.desc()),
}))
