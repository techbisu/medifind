import { NextRequest, NextResponse } from 'next/server'
import { db, safeQuery } from '@/lib/db'
import { PROVIDER_INCLUDE, toProviderDTO } from '@/lib/providers'

/**
 * Haversine distance between two lat/lng points in kilometers.
 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || ''
  const city = searchParams.get('city') || ''
  const specialty = searchParams.get('specialty') || ''
  const q = searchParams.get('q') || ''
  const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50)
  const offset = parseInt(searchParams.get('offset') || '0')
  const approvedOnly = searchParams.get('approvedOnly') !== 'false'

  // Nearby search params
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null
  const radiusKm = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : null
  const sortBy = searchParams.get('sortBy') || 'default' // 'default' | 'distance'

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

  // If location is set, we need geocoded providers. Filter out null lat/lng when sorting by distance.
  if (lat !== null && lng !== null) {
    where.latitude = { not: null }
    where.longitude = { not: null }
  }

  // Fetch more results when sorting by distance so we have enough after radius filter
  const fetchLimit = (lat !== null && lng !== null) ? Math.max(limit, 100) : limit

  const [providersRaw, total] = await Promise.all([
    safeQuery(() => db.provider.findMany({
      where,
      include: PROVIDER_INCLUDE,
      orderBy: [
        { subscriptionTier: 'desc' },
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      take: fetchLimit,
      skip: offset,
    }), []),
    safeQuery(() => db.provider.count({ where }), 0),
  ])

  // Compute distance and apply radius filter when location is provided
  let providers = providersRaw
  if (lat !== null && lng !== null) {
    const withDistance = providersRaw
      .map((p) => ({
        ...p,
        _distance: (p.latitude != null && p.longitude != null)
          ? haversineKm(lat, lng, p.latitude, p.longitude)
          : null,
      }))
      .filter((p) => p._distance !== null)
      .filter((p) => (radiusKm ? (p._distance as number) <= radiusKm : true))

    if (sortBy === 'distance') {
      withDistance.sort((a, b) => (a._distance as number) - (b._distance as number))
    } else {
      // Default: still prioritize by tier, but within same tier prefer closer
      withDistance.sort((a, b) => {
        const tierOrder: Record<string, number> = { ENTERPRISE: 0, PRO: 1, FREE: 2 }
        const ta = tierOrder[a.subscriptionTier] ?? 3
        const tb = tierOrder[b.subscriptionTier] ?? 3
        if (ta !== tb) return ta - tb
        return (a._distance as number) - (b._distance as number)
      })
    }

    providers = withDistance.slice(0, limit)
  }

  const dtos = providers.map((p: any) => {
    const dto = toProviderDTO(p)
    if (p._distance != null) {
      ;(dto as any).distance = Math.round(p._distance * 10) / 10 // one decimal
    }
    return dto
  })

  return NextResponse.json({
    providers: dtos,
    total: lat !== null && lng !== null ? dtos.length : total,
    limit,
    offset,
    userLocation: lat !== null && lng !== null ? { lat, lng, radius: radiusKm } : null,
    sortBy,
  })
}
