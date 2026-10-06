import type { MetadataRoute } from 'next'
import { publicEnv } from '@/lib/public-env'

// Public pages only. Dashboards, payment pages and the API are behind a login, so they stay out.
// No lastModified: the pages are static and a made-up date would be misleading.
const PUBLIC_PATHS = [
  { path: '', priority: 1 },
  { path: '/services', priority: 0.8 },
  { path: '/about', priority: 0.7 },
  { path: '/contact', priority: 0.6 },
  { path: '/register', priority: 0.5 },
  { path: '/login', priority: 0.4 },
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map(({ path, priority }) => ({
    url: `${publicEnv.NEXT_PUBLIC_APP_URL}${path}`,
    priority,
  }))
}
