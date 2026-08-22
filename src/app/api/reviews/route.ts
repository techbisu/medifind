import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

const ReviewCreateSchema = z.object({
  providerId: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().nullable(),
  userName: z.string().max(120).optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const providerId = searchParams.get('providerId')
  if (!providerId || providerId.length > 100) {
    return NextResponse.json({ error: 'Valid providerId required' }, { status: 400 })
  }

  const reviews = await db.review.findMany({
    where: { providerId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json({ reviews })
}

// Basic per-IP review rate limit (5 per hour per IP)
const reviewAttempts = new Map<string, { count: number; resetAt: number }>()
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = reviewAttempts.get(ip)
  if (!entry || entry.resetAt < now) {
    reviewAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many reviews from your IP. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const session = await getSession()
    const parsed = ReviewCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const { providerId, rating, comment, userName } = parsed.data

    // Verify provider exists and is approved
    const provider = await db.provider.findUnique({
      where: { id: providerId },
      select: { id: true, status: true },
    })
    if (!provider || provider.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    const name = session?.name || userName || 'Anonymous'

    const review = await db.review.create({
      data: {
        providerId,
        userId: session?.id || null,
        userName: name,
        rating,
        comment: comment || null,
        isVerified: !!session,
      },
    })

    // Update provider's aggregate rating atomically
    const stats = await db.review.aggregate({
      where: { providerId },
      _avg: { rating: true },
      _count: { rating: true },
    })
    await db.provider.update({
      where: { id: providerId },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count.rating || 0,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (e) {
    console.error('Review creation error:', e)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
