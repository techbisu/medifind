import { NextResponse } from 'next/server'
import { db, safeQuery } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const [
    totalProviders,
    pendingProviders,
    approvedProviders,
    totalDoctors,
    totalShops,
    totalLabs,
    totalAppointments,
    pendingAppointments,
    totalUsers,
    totalSubscriptions,
    activeSubscriptions,
    reviews,
  ] = await Promise.all([
    safeQuery(() => db.provider.count(), 0),
    safeQuery(() => db.provider.count({ where: { status: 'PENDING' } }), 0),
    safeQuery(() => db.provider.count({ where: { status: 'APPROVED' } }), 0),
    safeQuery(() => db.provider.count({ where: { type: 'DOCTOR' } }), 0),
    safeQuery(() => db.provider.count({ where: { type: 'MEDICAL_SHOP' } }), 0),
    safeQuery(() => db.provider.count({ where: { type: 'CLINIC_LAB' } }), 0),
    safeQuery(() => db.appointment.count(), 0),
    safeQuery(() => db.appointment.count({ where: { status: 'PENDING' } }), 0),
    safeQuery(() => db.user.count(), 0),
    safeQuery(() => db.subscription.count(), 0),
    safeQuery(() => db.subscription.count({ where: { status: 'ACTIVE' } }), 0),
    safeQuery(() => db.review.count(), 0),
  ])

  const revenueAgg = await safeQuery(() => db.subscription.aggregate({
    where: { status: 'ACTIVE' },
    _sum: { amountPaid: true },
  }), { _sum: { amountPaid: 0 } })

  const tierBreakdown = await safeQuery(() => db.provider.groupBy({
    by: ['subscriptionTier'],
    _count: { _all: true },
  }), [])

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentProviders = await safeQuery(() => db.provider.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { id: true, name: true, type: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  }), [])

  return NextResponse.json({
    counts: {
      totalProviders,
      pendingProviders,
      approvedProviders,
      totalDoctors,
      totalShops,
      totalLabs,
      totalAppointments,
      pendingAppointments,
      totalUsers,
      totalSubscriptions,
      activeSubscriptions,
      reviews,
    },
    revenue: revenueAgg._sum?.amountPaid || 0,
    tierBreakdown: tierBreakdown.map((t: any) => ({
      tier: t.subscriptionTier,
      count: t._count?._all || 0,
    })),
    recentProviders,
  })
}
