import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
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
    db.provider.count(),
    db.provider.count({ where: { status: 'PENDING' } }),
    db.provider.count({ where: { status: 'APPROVED' } }),
    db.provider.count({ where: { type: 'DOCTOR' } }),
    db.provider.count({ where: { type: 'MEDICAL_SHOP' } }),
    db.provider.count({ where: { type: 'CLINIC_LAB' } }),
    db.appointment.count(),
    db.appointment.count({ where: { status: 'PENDING' } }),
    db.user.count(),
    db.subscription.count(),
    db.subscription.count({ where: { status: 'ACTIVE' } }),
    db.review.count(),
  ])

  // Revenue from active subscriptions
  const revenueAgg = await db.subscription.aggregate({
    where: { status: 'ACTIVE' },
    _sum: { amountPaid: true },
  })

  // Subscription tier breakdown
  const tierBreakdown = await db.provider.groupBy({
    by: ['subscriptionTier'],
    _count: { _all: true },
  })

  // Recent signups (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentProviders = await db.provider.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { id: true, name: true, type: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

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
    revenue: revenueAgg._sum.amountPaid || 0,
    tierBreakdown: tierBreakdown.map((t) => ({
      tier: t.subscriptionTier,
      count: t._count._all,
    })),
    recentProviders,
  })
}
