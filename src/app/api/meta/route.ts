import { NextResponse } from 'next/server'
import { db, safeQuery } from '@/lib/db'

export async function GET() {
  const [specialties, healthIssues, cities] = await Promise.all([
    safeQuery(() => db.specialty.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }), []),
    safeQuery(() => db.healthIssue.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }), []),
    safeQuery(async () => {
      const result = await db.provider.findMany({
        where: { status: 'APPROVED', city: { not: null } },
        select: { city: true },
        distinct: ['city'],
      })
      return result
    }, []),
  ])

  return NextResponse.json({
    specialties,
    healthIssues,
    cities: cities.map((c: any) => c.city).filter(Boolean),
  })
}
