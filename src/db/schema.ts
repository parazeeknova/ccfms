import { jsonb, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core'

export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  vin: varchar('vin', { length: 17 }).notNull().unique(),
  manufacturer: varchar('manufacturer', { length: 50 }).notNull(),
  model: varchar('model', { length: 50 }).notNull(),
  fleetId: varchar('fleet_id', { length: 50 }).notNull(),
  ownerOperator: jsonb('owner_operator').notNull(),
  registrationStatus: varchar('registration_status', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
