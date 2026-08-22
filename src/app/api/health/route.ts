import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/health
 * Lightweight health check endpoint for load balancers, uptime monitors, and k8s probes.
 *
 * Returns 200 if the app can reach the database, 503 otherwise.
 * Does NOT expose internal details in production (security through obscurity —
 * real monitoring tools can use the status code).
 */
export async function GET() {
  try {
    // Quick DB ping (cheap query)
    await db.$queryRaw`SELECT 1`

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        // Don't leak version/commit in prod — attackers use it for targeted exploits
        env: process.env.NODE_ENV,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Health check failed:', err)
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        // In production, don't leak the error message
        error: process.env.NODE_ENV === 'production' ? 'Database unreachable' : String(err),
      },
      { status: 503 }
    )
  }
}
