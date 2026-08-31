import { NextRequest, NextResponse } from 'next/server'
import { db, safeQuery } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { doctorProviderId, shopProviderId, name, address, phone, city, area, visitingHours, schedules } = body

  if (!doctorProviderId || !name) {
    return NextResponse.json({ error: 'doctorProviderId and name required' }, { status: 400 })
  }

  // Verify ownership
  const doctor = await db.provider.findFirst({
    where: { id: doctorProviderId, userId: session.id, type: 'DOCTOR' },
  })
  if (!doctor) {
    return NextResponse.json({ error: 'Doctor provider not found' }, { status: 404 })
  }

  // Verify shop exists if provided
  if (shopProviderId) {
    const shop = await db.provider.findFirst({
      where: { id: shopProviderId, type: 'MEDICAL_SHOP', status: 'APPROVED' },
    })
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }
  }

  const chamber = await db.chamber.create({
    data: {
      doctorProviderId,
      shopProviderId: shopProviderId || null,
      name,
      address: address || null,
      phone: phone || null,
      city: city || null,
      area: area || null,
      visitingHours: visitingHours || null,
      schedules: schedules?.length
        ? {
            create: schedules.map((s: any) => ({
              dayOfWeek: parseInt(s.dayOfWeek),
              startTime: s.startTime,
              endTime: s.endTime,
              maxPatients: parseInt(s.maxPatients) || 10,
              isAvailable: s.isAvailable !== false,
              notes: s.notes || null,
            }))
          }
        : undefined,
    },
    include: { schedules: true, shop: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ chamber }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const providerId = searchParams.get('providerId')

  const where: any = {}
  if (providerId) {
    where.OR = [
      { doctorProviderId: providerId },
      { shopProviderId: providerId },
    ]
  }

  const chambers = await safeQuery(() => db.chamber.findMany({
    where,
    include: {
      schedules: true,
      doctor: { select: { id: true, name: true, slug: true } },
      shop: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: 'asc' },
  }), [])

  return NextResponse.json({ chambers })
}
