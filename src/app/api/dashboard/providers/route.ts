import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { PROVIDER_INCLUDE, toProviderDTO, generateUniqueSlug } from '@/lib/providers'

// GET - get all providers for current user
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const providers = await db.provider.findMany({
    where: { userId: session.id },
    include: {
      ...PROVIDER_INCLUDE,
      subscriptions: {
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ providers: providers.map(toProviderDTO) })
}

// POST - create new provider listing
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Upgrade role to PROVIDER if not already
  if (session.role === 'PUBLIC') {
    await db.user.update({
      where: { id: session.id },
      data: { role: 'PROVIDER' },
    })
  }

  const body = await req.json()
  const {
    type,
    name,
    tagline,
    description,
    phone,
    email,
    website,
    address,
    city,
    area,
    pincode,
    latitude,
    longitude,
    bookingEnabled,
    // Doctor-specific
    specialty,
    specialties,
    qualifications,
    experienceYears,
    consultationFee,
    languages,
    healthIssues,
    about,
    gender,
    registrationNo,
  } = body

  if (!type || !name) {
    return NextResponse.json({ error: 'Type and name required' }, { status: 400 })
  }

  const slug = await generateUniqueSlug(name)

  const provider = await db.provider.create({
    data: {
      userId: session.id,
      type,
      name,
      slug,
      tagline: tagline || null,
      description: description || null,
      phone: phone || null,
      email: email || null,
      website: website || null,
      address: address || null,
      city: city || null,
      area: area || null,
      pincode: pincode || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      status: 'PENDING',
      subscriptionTier: 'FREE',
      bookingEnabled: bookingEnabled !== false, // default true unless explicitly false
      ...(type === 'DOCTOR' && {
        doctorProfile: {
          create: {
            specialty: specialty || null,
            specialtiesJson: JSON.stringify(specialties || (specialty ? [specialty] : [])),
            qualifications: qualifications || null,
            experienceYears: parseInt(experienceYears) || 0,
            consultationFee: parseFloat(consultationFee) || 0,
            languagesJson: JSON.stringify(languages || []),
            healthIssuesJson: JSON.stringify(healthIssues || []),
            about: about || null,
            gender: gender || null,
            registrationNo: registrationNo || null,
          },
        },
      }),
    },
    include: PROVIDER_INCLUDE,
  })

  // Auto-subscribe to FREE plan
  const freePlan = await db.plan.findUnique({ where: { tier: 'FREE' } })
  if (freePlan) {
    await db.subscription.create({
      data: {
        providerId: provider.id,
        userId: session.id,
        planId: freePlan.id,
        status: 'ACTIVE',
        amountPaid: 0,
      },
    })
  }

  return NextResponse.json({ provider: toProviderDTO(provider) }, { status: 201 })
}
