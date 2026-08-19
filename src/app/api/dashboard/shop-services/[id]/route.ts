import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

async function checkOwnership(serviceId: string, userId: string) {
  const svc = await db.shopService.findUnique({
    where: { id: serviceId },
    select: { providerId: true },
  })
  if (!svc) return null
  const provider = await db.provider.findFirst({
    where: { id: svc.providerId, userId },
  })
  return provider ? svc : null
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const svc = await checkOwnership(id, session.id)
  if (!svc) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
  }

  const body = await req.json()
  const { name, description, price, category, isActive } = body

  const update: any = {}
  if (name !== undefined) update.name = name
  if (description !== undefined) update.description = description
  if (price !== undefined) update.price = parseFloat(price) || 0
  if (category !== undefined) update.category = category
  if (isActive !== undefined) update.isActive = !!isActive

  const updated = await db.shopService.update({ where: { id }, data: update })
  return NextResponse.json({ service: updated })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const svc = await checkOwnership(id, session.id)
  if (!svc) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
  }

  await db.shopService.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
