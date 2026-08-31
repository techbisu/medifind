import { NextResponse } from 'next/server'
import { db, safeQuery } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const subscriptions = await safeQuery(() => db.subscription.findMany({
    include: {
      provider: { select: { id: true, name: true, slug: true, type: true, subscriptionTier: true } },
      user: { select: { id: true, name: true, email: true } },
      plan: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  }), [])

  return NextResponse.json({ subscriptions })
}
