import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { PROVIDER_INCLUDE, toProviderDTO } from '@/lib/providers'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

// GET - list all providers (with filters)
export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || ''
  const type = searchParams.get('type') || ''
  const q = searchParams.get('q') || ''

  const where: any = {}
  if (status) where.status = status
  if (type) where.type = type
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { city: { contains: q } },
      { area: { contains: q } },
    ]
  }

  const providers = await db.provider.findMany({
    where,
    include: {
      ...PROVIDER_INCLUDE,
      user: { select: { id: true, email: true, name: true } },
      subscriptions: {
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json({ providers: providers.map(toProviderDTO) })
}

// PATCH - approve / suspend / reject
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const { id, status, verified } = body

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const data: any = {}
  if (status) data.status = status
  if (typeof verified === 'boolean') data.verified = verified

  const provider = await db.provider.update({
    where: { id },
    data,
    include: PROVIDER_INCLUDE,
  })

  return NextResponse.json({ provider: toProviderDTO(provider) })
}
