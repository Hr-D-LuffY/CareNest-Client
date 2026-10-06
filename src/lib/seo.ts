import type { Metadata } from 'next'

// The static share image lives at app/opengraph-image.png. A page that sets its own `openGraph`
// replaces the one from the root layout, which drops that image, so public pages use this helper
// to keep the same picture (and a matching X/Twitter card).
const SHARE_IMAGE = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt: 'CareNest: trusted care for your little ones. Childcare and supervised transport, in one place.',
} as const

type SocialMetadata = Pick<Metadata, 'openGraph' | 'twitter'>

export function socialMetadata(title: string, description: string): SocialMetadata {
  return {
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'CareNest',
      images: [SHARE_IMAGE],
    },
    twitter: { card: 'summary_large_image', title, description, images: [SHARE_IMAGE.url] },
  }
}
