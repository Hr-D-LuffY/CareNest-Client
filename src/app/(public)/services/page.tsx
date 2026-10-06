import { Check } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { BentoCard } from '@/components/landing/bento-card'
import { RouteScene } from '@/components/landing/route-scene'
import { SectionHeading } from '@/components/landing/section-heading'
import { WaitlistBars } from '@/components/landing/waitlist-bars'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { PageIntro } from '@/components/shared/page-intro'
import { buttonVariants } from '@/components/ui/button'
import {
  CURRENCY_CODE,
  TOP_UP_MAX_AMOUNT,
  TOP_UP_MIN_AMOUNT,
  TRANSPORT_BASE_FARE,
} from '@/lib/constants'
import { socialMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'

const TITLE = 'Services'
const DESCRIPTION =
  'Care rooms run by verified staff, a smart waitlist, supervised rides and one wallet, with every fee explained.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...socialMetadata(`${TITLE} | CareNest`, DESCRIPTION),
}

const TOP_UP_RANGE = `${TOP_UP_MIN_AMOUNT} to ${TOP_UP_MAX_AMOUNT.toLocaleString('en-US')} ${CURRENCY_CODE}`

// The numbers and formulas below are the backend's own (booking, transport, payment and waitlist
// services), so the page and the app can never disagree.
const FEES = [
  {
    label: 'A care session',
    formula: 'hours × hourly rate × room multiplier',
    note: 'Estimated when you book, final when your child is checked out.',
  },
  {
    label: 'A supervised ride',
    formula: `${TRANSPORT_BASE_FARE} ${CURRENCY_CODE} + minutes × per-minute rate`,
    note: 'Charged when the driver ends the trip.',
  },
  {
    label: 'A wallet top-up',
    formula: TOP_UP_RANGE,
    note: 'Paid with bKash, per top-up.',
  },
  {
    label: 'Waitlist priority',
    formula: '0.5 × hours waited + 0.3 × tier − 0.4 × cancellations',
    note: 'Tier weight: Monthly 3, Weekly 2, Daily 1.',
  },
] as const

const TIERS = [
  { name: 'Daily', weight: 1, text: 'Day-by-day care' },
  { name: 'Weekly', weight: 2, text: 'A standing weekly place' },
  { name: 'Monthly', weight: 3, text: 'The longest commitment' },
] as const

const VEHICLES = ['Car', 'Van', 'Bus'] as const

type ServiceSectionProps = {
  id: string
  eyebrow: string
  title: string
  description: string
  points: readonly string[]
  visual: ReactNode
  // Put the picture on the left on large screens.
  flip?: boolean
  tinted?: boolean
}

function ServiceSection({
  id,
  eyebrow,
  title,
  description,
  points,
  visual,
  flip = false,
  tinted = false,
}: ServiceSectionProps) {
  return (
    <section id={id} className={cn('scroll-mt-20 py-12 sm:py-20', tinted && 'border-y bg-card/50')}>
      <div className="page-container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={cn('flex flex-col gap-6', flip && 'lg:order-2')}>
          <Reveal>
            <SectionHeading
              eyebrow={eyebrow}
              title={title}
              description={description}
              align="start"
            />
          </Reveal>
          <Stagger className="flex flex-col gap-3" gap={0.08}>
            {points.map((point) => (
              <StaggerItem key={point}>
                <div className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                    <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                  </span>
                  <span className="text-pretty">{point}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <Reveal className={cn(flip && 'lg:order-1')}>{visual}</Reveal>
      </div>
    </section>
  )
}

function TierCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {TIERS.map(({ name, weight, text }) => (
        <BentoCard key={name} featured={name === 'Monthly'} className="p-5 sm:p-5">
          <p className="font-heading text-2xl">{name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          <p className="mt-4 text-xs font-semibold tracking-wide text-info uppercase">
            Waitlist weight {weight}
          </p>
        </BentoCard>
      ))}
    </div>
  )
}

function WalletCard() {
  return (
    <BentoCard featured className="flex flex-col gap-6 p-8 sm:p-8">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Top up with bKash
      </p>
      <p className="font-heading text-4xl tabular-nums sm:text-5xl">{TOP_UP_RANGE}</p>
      <p className="text-sm text-pretty text-muted-foreground">
        You choose the amount for each top-up. Your balance pays for care sessions and rides, and
        every movement is listed in your wallet history.
      </p>
    </BentoCard>
  )
}

function VehicleChips() {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Vehicle types">
      {VEHICLES.map((vehicle) => (
        <li
          key={vehicle}
          className="rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium shadow-soft"
        >
          {vehicle}
        </li>
      ))}
    </ul>
  )
}

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Services"
        title="Everything for a care day, and what it costs"
        description="Care rooms, a fair waitlist, supervised rides and one wallet. Every fee is worked out by the server from the formulas below, so there are no surprises."
      />

      <section className="page-container py-12 sm:py-16">
        <Reveal>
          <SectionHeading
            eyebrow="Fees at a glance"
            title="How everything is priced"
            description="Rates are set by each sitter and driver, and the formulas never change."
          />
        </Reveal>
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2" gap={0.08}>
          {FEES.map(({ label, formula, note }) => (
            <StaggerItem key={label}>
              <BentoCard>
                <p className="text-sm font-semibold tracking-wide text-info uppercase">{label}</p>
                <p className="mt-3 font-heading text-xl text-balance sm:text-2xl">{formula}</p>
                <p className="mt-2 text-sm text-muted-foreground">{note}</p>
              </BentoCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <ServiceSection
        id="care-rooms"
        tinted
        eyebrow="Care rooms"
        title="Rooms run by verified staff"
        description="Each room runs on one weekday in a fixed time window, with a set number of seats and a care tier. Pick a room, pick a session date that matches its day, and book."
        points={[
          'Rooms are only given to verified sitters.',
          'You see how many seats are left before you book.',
          'The estimated fee is shown up front. Your wallet must cover it to book.',
          'Staff check your child in and out, and the final fee uses the real time in the room.',
        ]}
        visual={<TierCards />}
      />

      <ServiceSection
        id="waitlist"
        flip
        eyebrow="Smart waitlist"
        title="A full room is not a dead end"
        description="When every seat is taken, your booking still goes through as a waitlist place. When someone cancels, the child at the top of the queue is promoted automatically."
        points={[
          'Waiting longer ranks higher.',
          'Monthly children rank above Weekly, and Weekly above Daily.',
          'Recent cancellations lower a score a little, so seats are not held and dropped.',
          'If a waiting wallet no longer covers the fee, that place expires and the next child gets the seat.',
        ]}
        visual={<WaitlistBars />}
      />

      <ServiceSection
        id="transport"
        tinted
        eyebrow="Safe transport"
        title="A supervised ride, tied to your booking"
        description="Add a ride to a booking you already hold, then follow it from request to the end of the trip."
        points={[
          `Every ride starts from a flat ${TRANSPORT_BASE_FARE} ${CURRENCY_CODE}, and you need at least that in your wallet to request one.`,
          "The driver starts and ends the trip. The fare adds the minutes driven at the driver's per-minute rate.",
          'Drivers register their own vehicles, so you choose from real cars, vans and buses.',
          'The ride is linked to the booking, so the driver always knows which child and which session.',
        ]}
        visual={
          <div className="flex flex-col gap-4">
            <RouteScene />
            <VehicleChips />
          </div>
        }
      />

      <ServiceSection
        id="wallet"
        flip
        eyebrow="Wallet"
        title="One balance for care and rides"
        description="Top up once with bKash and pay for everything from the same wallet."
        points={[
          `Each top-up is between ${TOP_UP_MIN_AMOUNT} and ${TOP_UP_MAX_AMOUNT.toLocaleString('en-US')} ${CURRENCY_CODE}.`,
          'Care fees are charged when your child is checked out, and ride fares when the trip ends.',
          'Your wallet history lists every top-up, care fee and fare.',
          'bKash runs in sandbox mode here, so no real money moves.',
        ]}
        visual={<WalletCard />}
      />

      <section className="page-container py-12 sm:py-16">
        <Reveal>
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="max-w-xl text-3xl text-balance sm:text-4xl">Ready to book a seat?</h2>
            <p className="max-w-xl text-base text-pretty text-muted-foreground">
              Create a guardian account in a minute, or ask us anything first.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className={cn(
                  buttonVariants(),
                  'h-12 bg-cta px-6 text-base font-semibold text-cta-foreground hover:bg-cta/90',
                )}
              >
                Get started
              </Link>
              <Link
                href="/contact"
                className={cn(buttonVariants({ variant: 'outline' }), 'h-12 px-6 text-base')}
              >
                Contact us
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
