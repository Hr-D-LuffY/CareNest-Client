import type { MetadataRoute } from 'next'
import { publicEnv } from '@/lib/public-env'

// Search engines may crawl the public site. The signed-in areas (and the API) are kept out; those
// layouts also send `robots: { index: false }`.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/staff', '/admin', '/payment', '/api/'],
    },
    sitemap: `${publicEnv.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  }
}
