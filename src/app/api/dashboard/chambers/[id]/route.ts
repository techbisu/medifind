import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const chamber = await db.chamber.findUnique({
    where: { id },
    select: { doctorProviderId: true },
  })
  if (!chamber) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const doctor = await db.provider.findFirst({
    where: { id: chamber.doctorProviderId, userId: session.id },
  })
  if (!doctor && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, address, phone, city, area, visitingHours, isActive, schedules } = body
  const update: any = {}
  if (name !== undefined) update.name = name
  if (address !== undefined) update.address = address
  if (phone !== undefined) update.phone = phone
  if (city !== undefined) update.city = city
  if (area !== undefined) update.area = area
  if (visitingHours !== undefined) update.visitingHours = visitingHours
  if (isActive !== undefined) update.isActive = isActive

  const updated = await db.chamber.update({
    where: { id },
    data: update,
    include: { schedules: true },
  })

  // If schedules provided, replace all
  if (schedules !== undefined) {
    await db.schedule.deleteMany({ where: { chamberId: id } })
    if (Array.isArray(schedules) && schedules.length > 0) {
      await db.schedule.createMany({
        data: schedules.map((s: any) => ({
          chamberId: id,
          dayOfWeek: parseInt(s.dayOfWeek),
          startTime: s.startTime,
          endTime: s.endTime,
          maxPatients: parseInt(s.maxPatients) || 10,
          isAvailable: s.isAvailable !== false,
          notes: s.notes || null,
        })),
      })
    }
  }

  const refreshed = await db.chamber.findUnique({
    where: { id },
    include: { schedules: true },
  })
  return NextResponse.json({ chamber: refreshed })
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
  const chamber = await db.chamber.findUnique({
    where: { id },
    select: { doctorProviderId: true },
  })
  if (!chamber) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const doctor = await db.provider.findFirst({
    where: { id: chamber.doctorProviderId, userId: session.id },
  })
  if (!doctor && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.chamber.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
