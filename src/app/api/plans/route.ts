import { NextResponse } from 'next/server'
import { db, safeQuery } from '@/lib/db'

export async function GET() {
  const plans = await safeQuery(() => db.plan.findMany({
    where: { isActive: true },
    orderBy: [{ price: 'asc' }],
    include: {
      _count: { select: { subscriptions: true } },
    },
  }), [])
  return NextResponse.json({ plans })
}
