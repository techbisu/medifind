import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

/**
 * Dynamic sitemap.xml — generated at request time.
 * Includes: homepage, static pages, all approved providers.
 * Excludes: dashboard, admin, auth, private booking, API routes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://medifind.app'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/#plans`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // Approved providers
  let providerPages: MetadataRoute.Sitemap = []
  try {
    const providers = await db.provider.findMany({
      where: { status: 'APPROVED' },
      select: { slug: true, type: true, updatedAt: true },
    })

    providerPages = providers.map((p) => ({
      url: `${baseUrl}/#provider/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: p.type === 'DOCTOR' ? 0.9 : 0.7,
    }))
  } catch (e) {
    console.error('Sitemap generation failed:', e)
  }

  // City pages (derived from provider cities)
  let cityPages: MetadataRoute.Sitemap = []
  try {
    const cities = await db.provider.findMany({
      where: { status: 'APPROVED', city: { not: null } },
      select: { city: true },
      distinct: ['city'],
    })

    const types = ['DOCTOR', 'MEDICAL_SHOP', 'CLINIC_LAB']
    cityPages = cities
      .filter((c) => c.city)
      .flatMap((c) =>
        types.map((t) => ({
          url: `${baseUrl}/#${t.toLowerCase()}/${(c.city as string).toLowerCase().replace(/\s+/g, '-')}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }))
      )
  } catch (e) {
    console.error('Sitemap city generation failed:', e)
  }

  return [...staticPages, ...providerPages, ...cityPages]
}
