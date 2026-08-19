import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PROVIDER_INCLUDE, toProviderDTO } from '@/lib/providers'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const provider = await db.provider.findUnique({
    where: { slug },
    include: {
      ...PROVIDER_INCLUDE,
      chambers: {
        include: {
          shop: { select: { id: true, name: true, slug: true, address: true } },
          schedules: true,
        },
        orderBy: { createdAt: 'asc' },
      },
      shopChambers: {
        include: {
          doctor: { select: { id: true, name: true, slug: true } },
          schedules: true,
        },
        orderBy: { createdAt: 'asc' },
      },
      shopServices: { where: { isActive: true }, orderBy: { name: 'asc' } },
      labTests: { where: { isActive: true }, orderBy: { name: 'asc' } },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  if (provider.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Provider not available' }, { status: 404 })
  }

  db.provider.update({
    where: { id: provider.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {})

  // Build DTO + attach relations for the detail view
  const dto = toProviderDTO(provider) as any
  dto.chambers = (provider.chambers || []).map((c: any) => ({
    ...c,
    schedules: c.schedules || [],
  }))
  dto.shopChambers = (provider.shopChambers || []).map((c: any) => ({
    ...c,
    schedules: c.schedules || [],
  }))
  dto.shopServices = provider.shopServices || []
  dto.labTests = (provider.labTests || []).map((t: any) => ({
    ...t,
    fastingRequired: t.fastingRequired,
  }))
  dto.reviews = (provider.reviews || []).map((r: any) => ({
    ...r,
  }))

  return NextResponse.json({ provider: dto })
}
