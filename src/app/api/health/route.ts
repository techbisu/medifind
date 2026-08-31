import { NextResponse } from 'next/server'
import { db, safeQuery } from '@/lib/db'

/**
 * GET /api/health
 * Lightweight health check endpoint for load balancers, uptime monitors, and k8s probes.
 *
 * Returns 200 if the app can reach the database, 503 otherwise.
 * Does NOT expose internal details in production.
 */
export async function GET() {
  try {
    // Quick DB ping (cheap query) — wrapped in safeQuery to avoid crash
    const result = await safeQuery(async () => {
      await db.$queryRaw`SELECT 1`
      return true
    }, false)

    return NextResponse.json(
      {
        status: result ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
      },
      { status: result ? 200 : 503 }
    )
  } catch (err) {
    console.error('Health check failed:', err)
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        error: process.env.NODE_ENV === 'production' ? 'Database unreachable' : String(err),
      },
      { status: 503 }
    )
  }
}
