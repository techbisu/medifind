import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { PROVIDER_INCLUDE, toProviderDTO } from '@/lib/providers'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const provider = await db.provider.findUnique({
    where: { id },
    select: { userId: true, type: true },
  })

  if (!provider) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (provider.userId !== session.id && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const {
    name, tagline, description, phone, email, website, address, city, area, pincode, latitude, longitude,
    bookingEnabled,
    specialty, specialties, qualifications, experienceYears, consultationFee, languages, healthIssues, about, gender, registrationNo,
  } = body

  const update: any = {}
  for (const k of ['name', 'tagline', 'description', 'phone', 'email', 'website', 'address', 'city', 'area', 'pincode', 'logoUrl', 'coverUrl']) {
    if (k in body) update[k] = body[k]
  }
  if (latitude !== undefined) update.latitude = latitude ? parseFloat(latitude) : null
  if (longitude !== undefined) update.longitude = longitude ? parseFloat(longitude) : null
  if (typeof bookingEnabled === 'boolean') update.bookingEnabled = bookingEnabled

  const updated = await db.provider.update({
    where: { id },
    data: update,
    include: PROVIDER_INCLUDE,
  })

  // Update doctor profile if applicable
  if (provider.type === 'DOCTOR' && updated.doctorProfile) {
    await db.doctorProfile.update({
      where: { providerId: id },
      data: {
        ...(specialty !== undefined && { specialty }),
        ...(specialties !== undefined && { specialtiesJson: JSON.stringify(specialties) }),
        ...(qualifications !== undefined && { qualifications }),
        ...(experienceYears !== undefined && { experienceYears: parseInt(experienceYears) || 0 }),
        ...(consultationFee !== undefined && { consultationFee: parseFloat(consultationFee) || 0 }),
        ...(languages !== undefined && { languagesJson: JSON.stringify(languages) }),
        ...(healthIssues !== undefined && { healthIssuesJson: JSON.stringify(healthIssues) }),
        ...(about !== undefined && { about }),
        ...(gender !== undefined && { gender }),
        ...(registrationNo !== undefined && { registrationNo }),
      },
    })
  }

  const refreshed = await db.provider.findUnique({
    where: { id },
    include: PROVIDER_INCLUDE,
  })

  return NextResponse.json({ provider: toProviderDTO(refreshed) })
}
