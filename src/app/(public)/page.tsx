import type { Metadata } from 'next'
import { BookingTimeline } from '@/components/home/booking-timeline'
import { ChapterIntro } from '@/components/home/chapter-intro'
import { CHAPTERS } from '@/components/home/chapters'
import { Faq } from '@/components/home/faq'
import { HeroNursery } from '@/components/home/hero-nursery'
import { JourneySection } from '@/components/home/journey-section'
import { NumbersBand } from '@/components/home/numbers-band'
import { RoleTabs } from '@/components/home/role-tabs'
import { StoryProgress } from '@/components/home/story-progress'
import { TrustChain } from '@/components/home/trust-chain'
import { WhatIsCareNest } from '@/components/home/what-is-carenest'
import { FinalCta } from '@/components/landing/final-cta'
import { Highlights } from '@/components/landing/highlights'
import { TransportSection } from '@/components/landing/transport-section'
import { WaitlistSection } from '@/components/landing/waitlist-section'
import { Reveal } from '@/components/motion/reveal'
import { socialMetadata } from '@/lib/seo'

const TITLE = 'CareNest | A daycare platform for families and care teams'
const DESCRIPTION =
  'CareNest is a daycare platform: families book a seat in a care room run by verified staff, arrange a supervised ride and pay from one wallet. A full room joins the smart waitlist instead of failing.'

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  ...socialMetadata(TITLE, DESCRIPTION),
}

const [WHAT, GET, HOW, WHO, KNOW, START] = CHAPTERS

// The home page, told as a story in six chapters after an animated hero: what CareNest is, what you
// get, how it works, who stands behind it, the questions people ask, and the invitation to begin.
// A bar under the navbar names the chapter you are in. Most sections are Server Components; the hero
// scene, the role tabs, the booking viewer, the verification card and the progress bar are the small
// client leaves. The earlier home page is still at /classic.
export default function HomePage() {
  return (
    <>
      <HeroNursery />

      <div>
        <StoryProgress />

        <div id={WHAT.id} className="scroll-mt-28">
          <ChapterIntro
            number={1}
            name={WHAT.label}
            title="Let us start with the simple answer"
            text="No jargon. Here is the whole idea, and then who it is for."
          />
          <WhatIsCareNest />
          <div className="page-container pb-16 sm:pb-24">
            <Reveal className="max-w-2xl">
              <p className="text-sm font-semibold tracking-wide text-info uppercase">Who uses it</p>
              <h3 className="mt-3 text-3xl text-balance sm:text-4xl">
                Families on one side, the care team on the other
              </h3>
              <p className="mt-3 text-base text-pretty text-muted-foreground sm:text-lg">
                Pick who you are to see what that account gets.
              </p>
            </Reveal>
            <Reveal className="mt-10" delay={0.1}>
              <RoleTabs />
            </Reveal>
          </div>
        </div>

        <div id={GET.id} className="scroll-mt-28">
          <ChapterIntro
            number={2}
            name={GET.label}
            title="Four things, in one account"
            text="A seat in a room you can trust, a fair place in line when it is full, a safe ride, and one wallet for all of it."
          />
          <div className="pt-4">
            <Highlights />
          </div>
          <WaitlistSection />
          <TransportSection />
          <NumbersBand />
        </div>

        <div id={HOW.id} className="scroll-mt-28">
          {/* The navbar's "Guide" link lands here, on the start of the chapter. */}
          <div id="how-it-works" className="scroll-mt-28">
            <ChapterIntro
              number={3}
              name={HOW.label}
              title="From a first booking to a day well spent"
              text="Four steps get a parent started. Then watch one booking go all the way through."
            />
            <BookingTimeline withHeading={false} anchorId="booking-steps" />
            <JourneySection />
          </div>
        </div>

        <div id={WHO.id} className="scroll-mt-28">
          <ChapterIntro
            number={4}
            name={WHO.label}
            title="Nobody takes a booking until an admin has verified them"
            text="That is the promise behind every seat. Here is how it is kept."
          />
          <TrustChain />
        </div>

        <div id={KNOW.id} className="scroll-mt-28">
          {/* The navbar's "FAQ" link lands here, on the start of the chapter. */}
          <div id="faq" className="scroll-mt-28">
            <ChapterIntro
              number={5}
              name={KNOW.label}
              title="The questions people ask first"
              text="Short answers, in plain words."
            />
            <Faq withHeading={false} anchorId="faq-list" />
          </div>
        </div>

        <div id={START.id} className="scroll-mt-28 pt-8">
          <FinalCta />
        </div>
      </div>
    </>
  )
}
