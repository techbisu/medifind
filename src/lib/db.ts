import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In production, no query logging. In dev, log only errors (not every query).
const logLevel = process.env.NODE_ENV === 'production'
  ? ['error', 'warn'] as const
  : ['error', 'warn'] as const

/**
 * Prisma client with graceful error handling.
 *
 * On Vercel serverless, SQLite files in the repo are read-only and may not
 * persist between invocations. If the database connection fails, the app
 * should still render (with empty data) rather than crash with 500 errors.
 *
 * For production, switch to PostgreSQL by changing `provider` in prisma/schema.prisma
 * and setting DATABASE_URL to a real Postgres connection string.
 */
let prismaClient: PrismaClient
try {
  prismaClient = globalForPrisma.prisma ?? new PrismaClient({ log: [...logLevel] })
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient
} catch (e) {
  console.error('Failed to initialize Prisma client:', e)
  // Create a stub that will throw on query, caught by API routes
  prismaClient = null as any
}

export const db = prismaClient

/**
 * Helper to safely execute a database query with a fallback.
 * Use in API routes to prevent 500 errors when the database is unavailable.
 */
export async function safeQuery<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!db) return fallback
  try {
    return await fn()
  } catch (e) {
    console.error('Database query failed:', e)
    return fallback
  }
}
