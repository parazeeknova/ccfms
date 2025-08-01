import process from 'node:process'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/ccfms'

const client = postgres(connectionString, { max: 10 })
export const db = drizzle(client)
