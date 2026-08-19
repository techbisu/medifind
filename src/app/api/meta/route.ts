import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const [specialties, healthIssues, cities] = await Promise.all([
    db.specialty.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    db.healthIssue.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    db.provider.findMany({
      where: { status: 'APPROVED', city: { not: null } },
      select: { city: true },
      distinct: ['city'],
    }),
  ])

  return NextResponse.json({
    specialties,
    healthIssues,
    cities: cities.map((c) => c.city).filter(Boolean),
  })
}
