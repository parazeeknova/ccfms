import { decimal, index, jsonb, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core'

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
})

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
}))
