import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// POST - subscribe provider to a plan
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { providerId, planId, autoRenew } = body

  if (!providerId || !planId) {
    return NextResponse.json({ error: 'providerId and planId required' }, { status: 400 })
  }

  // Verify ownership
  const provider = await db.provider.findFirst({
    where: { id: providerId, userId: session.id },
  })
  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  const plan = await db.plan.findUnique({ where: { id: planId } })
  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  // Expire existing active subscriptions for this provider
  await db.subscription.updateMany({
    where: { providerId, status: 'ACTIVE' },
    data: { status: 'EXPIRED' },
  })

  // Create new subscription
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + (plan.billingCycle === 'YEARLY' ? 365 : 30))

  const subscription = await db.subscription.create({
    data: {
      providerId,
      userId: session.id,
      planId,
      status: 'ACTIVE',
      amountPaid: plan.price,
      autoRenew: !!autoRenew,
      endDate,
    },
    include: { plan: true },
  })

  // Update provider tier
  await db.provider.update({
    where: { id: providerId },
    data: {
      subscriptionTier: plan.tier,
      verified: plan.verifiedBadge || provider.verified,
    },
  })

  return NextResponse.json({ subscription }, { status: 201 })
}
