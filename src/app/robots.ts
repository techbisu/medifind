import { MetadataRoute } from 'next'

/**
 * robots.txt — allow public healthcare discovery, block private areas.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://medifind.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/api/',
          '/#dashboard',
          '/#admin',
          '/#login',
          '/#register',
          '/#book-appointment',
          '/#provider-onboarding',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
