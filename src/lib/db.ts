import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In production, no query logging. In dev, log only errors (not every query).
const logLevel = process.env.NODE_ENV === 'production'
  ? ['error', 'warn'] as const
  : ['error', 'warn'] as const

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [...logLevel],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db