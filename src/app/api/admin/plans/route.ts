import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  const plans = await db.plan.findMany({
    orderBy: [{ price: 'asc' }],
    include: {
      _count: { select: { subscriptions: true } },
    },
  })
  return NextResponse.json({ plans })
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const { name, tier, price, billingCycle, description, featuresJson, maxChambers, maxLabTests, maxShopServices, priorityListing, verifiedBadge, isActive } = body

  if (!name || !tier) {
    return NextResponse.json({ error: 'Name and tier required' }, { status: 400 })
  }

  const plan = await db.plan.create({
    data: {
      name,
      tier,
      price: parseFloat(price) || 0,
      billingCycle: billingCycle || 'MONTHLY',
      description: description || null,
      featuresJson: featuresJson || '[]',
      maxChambers: maxChambers ?? 1,
      maxLabTests: maxLabTests ?? 5,
      maxShopServices: maxShopServices ?? 5,
      priorityListing: !!priorityListing,
      verifiedBadge: !!verifiedBadge,
      isActive: isActive !== false,
    },
  })

  return NextResponse.json({ plan }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const { id, ...data } = body
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const update: any = {}
  for (const k of ['name', 'tier', 'billingCycle', 'description', 'featuresJson', 'priorityListing', 'verifiedBadge', 'isActive']) {
    if (k in data) update[k] = data[k]
  }
  if ('price' in data) update.price = parseFloat(data.price) || 0
  if ('maxChambers' in data) update.maxChambers = parseInt(data.maxChambers) || 0
  if ('maxLabTests' in data) update.maxLabTests = parseInt(data.maxLabTests) || 0
  if ('maxShopServices' in data) update.maxShopServices = parseInt(data.maxShopServices) || 0

  const plan = await db.plan.update({ where: { id }, data: update })
  return NextResponse.json({ plan })
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  await db.plan.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
