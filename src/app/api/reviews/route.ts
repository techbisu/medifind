import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const providerId = searchParams.get('providerId')
  if (!providerId) {
    return NextResponse.json({ error: 'providerId required' }, { status: 400 })
  }

  const reviews = await db.review.findMany({
    where: { providerId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json({ reviews })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const session = await getSession()
    const { providerId, rating, comment, userName } = body

    if (!providerId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const name = session?.name || userName || 'Anonymous'

    const review = await db.review.create({
      data: {
        providerId,
        userId: session?.id || null,
        userName: name,
        rating: parseInt(rating),
        comment: comment || null,
        isVerified: !!session,
      },
    })

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
