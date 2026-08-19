import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PROVIDER_INCLUDE, toProviderDTO } from '@/lib/providers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || ''
  const city = searchParams.get('city') || ''
  const specialty = searchParams.get('specialty') || ''
  const q = searchParams.get('q') || ''
  const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50)
  const offset = parseInt(searchParams.get('offset') || '0')
  const approvedOnly = searchParams.get('approvedOnly') !== 'false'

  const where: any = {}
  if (approvedOnly) where.status = 'APPROVED'
  if (type) where.type = type
  if (city) where.city = { contains: city }
  if (specialty) where.doctorProfile = { specialty: { contains: specialty } }
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { tagline: { contains: q } },
      { description: { contains: q } },
      { area: { contains: q } },
      { city: { contains: q } },
      { doctorProfile: { specialty: { contains: q } } },
      { doctorProfile: { healthIssuesJson: { contains: q } } },
    ]
  }

  const [providers, total] = await Promise.all([
    db.provider.findMany({
      where,
      include: PROVIDER_INCLUDE,
      orderBy: [
        { subscriptionTier: 'desc' },
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      take: limit,
      skip: offset,
    }),
    db.provider.count({ where }),
  ])

  return NextResponse.json({
    providers: providers.map(toProviderDTO),
    total,
    limit,
    offset,
  })
}
