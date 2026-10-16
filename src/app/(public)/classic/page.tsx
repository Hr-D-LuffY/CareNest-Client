import type { Metadata } from 'next'
import { FinalCta } from '@/components/landing/final-cta'
import { Hero } from '@/components/landing/hero'
import { Highlights } from '@/components/landing/highlights'
import { HowItWorks } from '@/components/landing/how-it-works'
import { RolesSection } from '@/components/landing/roles-section'
import { TransportSection } from '@/components/landing/transport-section'
import { WaitlistSection } from '@/components/landing/waitlist-section'
import { socialMetadata } from '@/lib/seo'

const TITLE = 'CareNest | Trusted childcare and supervised transport'
const DESCRIPTION =
  'Book a seat in a care room run by verified staff, request a supervised ride and pay from one wallet. A full room joins the smart waitlist instead of failing.'

// The earlier home page, kept at /classic for reference. It is not indexed and not in the sitemap:
// the home page at / is the one search engines and visitors see.
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  ...socialMetadata(TITLE, DESCRIPTION),
}

// The landing page: all Server Components. Only the two illustrations and the scroll reveals are
// client-side, and each of those is a small leaf.
export default function ClassicHomePage() {
  return (
    <>
      <Hero />
      <Highlights />
      <HowItWorks />
      <WaitlistSection />
      <TransportSection />
      <RolesSection />
      <FinalCta />
    </>
  )
}
