import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

async function checkOwnership(labTestId: string, userId: string) {
  const labTest = await db.labTest.findUnique({
    where: { id: labTestId },
    select: { providerId: true },
  })
  if (!labTest) return null
  const provider = await db.provider.findFirst({
    where: { id: labTest.providerId, userId },
  })
  return provider ? labTest : null
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
  const labTest = await checkOwnership(id, session.id)
  if (!labTest) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
  }

  const body = await req.json()
  const { name, description, price, discountPrice, category, sampleType, reportTime, fastingRequired, isActive } = body

  const update: any = {}
  if (name !== undefined) update.name = name
  if (description !== undefined) update.description = description
  if (price !== undefined) update.price = parseFloat(price) || 0
  if (discountPrice !== undefined) update.discountPrice = discountPrice ? parseFloat(discountPrice) : null
  if (category !== undefined) update.category = category
  if (sampleType !== undefined) update.sampleType = sampleType
  if (reportTime !== undefined) update.reportTime = reportTime
  if (fastingRequired !== undefined) update.fastingRequired = !!fastingRequired
  if (isActive !== undefined) update.isActive = !!isActive

  const updated = await db.labTest.update({ where: { id }, data: update })
  return NextResponse.json({ labTest: updated })
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
  const labTest = await checkOwnership(id, session.id)
  if (!labTest) {
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
  }

  await db.labTest.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
