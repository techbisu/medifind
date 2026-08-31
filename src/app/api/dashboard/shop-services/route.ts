import { NextRequest, NextResponse } from 'next/server'
import { db, safeQuery } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { providerId, name, description, price, category } = body

  if (!providerId || !name) {
    return NextResponse.json({ error: 'providerId and name required' }, { status: 400 })
  }

  const provider = await db.provider.findFirst({
    where: { id: providerId, userId: session.id, type: 'MEDICAL_SHOP' },
  })
  if (!provider) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
  }

  const service = await db.shopService.create({
    data: {
      providerId,
      name,
      description: description || null,
      price: parseFloat(price) || 0,
      category: category || null,
    },
  })

  return NextResponse.json({ service }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const providerId = searchParams.get('providerId')
  if (!providerId) {
    return NextResponse.json({ error: 'providerId required' }, { status: 400 })
  }

  const services = await safeQuery(() => db.shopService.findMany({
    where: { providerId },
    orderBy: { name: 'asc' },
  }), [])
  return NextResponse.json({ services })
}
