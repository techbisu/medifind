import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const providerId = searchParams.get('providerId')
  const status = searchParams.get('status')

  // Get user's providers
  const userProviders = await db.provider.findMany({
    where: { userId: session.id },
    select: { id: true },
  })
  const providerIds = userProviders.map((p) => p.id)

  if (providerId && !providerIds.includes(providerId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const where: any = {}
  if (providerId) {
    where.providerId = providerId
  } else {
    where.providerId = { in: providerIds }
  }
  if (status) where.status = status

  const appointments = await db.appointment.findMany({
    where,
    include: {
      provider: { select: { id: true, name: true, slug: true, type: true } },
      chamber: { select: { id: true, name: true, address: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json({ appointments })
}
