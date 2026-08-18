import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const plans = await db.plan.findMany({
    where: { isActive: true },
    orderBy: [{ price: 'asc' }],
    include: {
      _count: { select: { subscriptions: true } },
    },
  })
  return NextResponse.json({ plans })
}
