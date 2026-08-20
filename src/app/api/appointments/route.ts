import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// Input validation schema — protects against malformed/malicious input
const AppointmentCreateSchema = z.object({
  providerId: z.string().min(1).max(100),
  chamberId: z.string().min(1).max(100).optional().nullable(),
  patientName: z.string().min(2).max(120).trim(),
  patientPhone: z.string().min(6).max(20).regex(/^[+\d\s()-]+$/, 'Invalid phone format'),
  patientEmail: z.string().email().max(200).optional().nullable().or(z.literal('')),
  patientAge: z.union([z.string(), z.number()]).optional().nullable(),
  patientGender: z.enum(['Male', 'Female', 'Other']).optional().nullable(),
  healthIssue: z.string().max(2000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
})

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

    // Validate input
    const parsed = AppointmentCreateSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return NextResponse.json(
        { error: firstError?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const data = parsed.data

    const provider = await db.provider.findUnique({
      where: { id: data.providerId },
      select: {
        id: true,
        status: true,
        type: true,
        bookingEnabled: true,
        doctorProfile: { select: { consultationFee: true } },
      },
    })
    if (!provider || provider.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Provider not available' }, { status: 400 })
    }
    if (!provider.bookingEnabled) {
      return NextResponse.json(
        { error: 'Online booking is disabled for this provider. Please call to book.' },
        { status: 403 }
      )
    }

    const fee = provider.doctorProfile?.consultationFee || 0

    const appointment = await db.appointment.create({
      data: {
        providerId: data.providerId,
        chamberId: data.chamberId || null,
        userId: session?.id || null,
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        patientEmail: data.patientEmail || null,
        patientAge: data.patientAge ? parseInt(String(data.patientAge)) : null,
        patientGender: data.patientGender || null,
        healthIssue: data.healthIssue || null,
        notes: data.notes || null,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime || null,
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
