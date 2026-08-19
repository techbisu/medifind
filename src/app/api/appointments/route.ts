import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const providerId = searchParams.get('providerId')
  const phone = searchParams.get('phone')

  const where: any = {}
  if (providerId) where.providerId = providerId
  if (phone) where.patientPhone = { contains: phone }

  const appointments = await db.appointment.findMany({
    where,
    include: {
      provider: {
        select: { id: true, name: true, slug: true, type: true, phone: true },
      },
      chamber: {
        select: { id: true, name: true, address: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({ appointments })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const session = await getSession()

    const {
      providerId,
      chamberId,
      patientName,
      patientPhone,
      patientEmail,
      patientAge,
      patientGender,
      healthIssue,
      notes,
      preferredDate,
      preferredTime,
    } = body

    if (!providerId || !patientName || !patientPhone || !preferredDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const provider = await db.provider.findUnique({
      where: { id: providerId },
      select: { id: true, status: true, doctorProfile: { select: { consultationFee: true } } },
    })
    if (!provider || provider.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Provider not available' }, { status: 400 })
    }

    const fee = provider.doctorProfile?.consultationFee || 0

    const appointment = await db.appointment.create({
      data: {
        providerId,
        chamberId: chamberId || null,
        userId: session?.id || null,
        patientName,
        patientPhone,
        patientEmail: patientEmail || null,
        patientAge: patientAge ? parseInt(patientAge) : null,
        patientGender: patientGender || null,
        healthIssue: healthIssue || null,
        notes: notes || null,
        preferredDate,
        preferredTime: preferredTime || null,
        status: 'PENDING',
        fee,
      },
      include: {
        provider: { select: { id: true, name: true, slug: true, type: true } },
        chamber: { select: { id: true, name: true, address: true } },
      },
    })

    return NextResponse.json({ appointment }, { status: 201 })
  } catch (e) {
    console.error('Appointment creation error:', e)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status } = body
    const session = await getSession()

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
    }

    const appt = await db.appointment.findUnique({
      where: { id },
      select: { providerId: true },
    })
    if (!appt) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (session) {
      const isOwner = await db.provider.findFirst({
        where: { id: appt.providerId, userId: session.id },
      })
      if (!isOwner && session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updated = await db.appointment.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ appointment: updated })
  } catch (e) {
    console.error('Appointment update error:', e)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
