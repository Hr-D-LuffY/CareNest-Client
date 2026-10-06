import { Baby, Bus, ListOrdered, ShieldCheck, Wallet } from 'lucide-react'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { TOP_UP_MAX_AMOUNT, TOP_UP_MIN_AMOUNT } from '@/lib/constants'
import { BentoCard } from './bento-card'

const QUEUE_PLACES = [1, 2, 3] as const

// Four plain facts about the product, straight under the hero, laid out as a bento grid. Real
// capabilities only: no numbers about users or reviews, because there are none to show.
export function Highlights() {
  return (
    <section aria-label="Why CareNest" className="page-container mt-10 pb-8 sm:mt-14 sm:pb-12">
      <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" gap={0.1}>
        <StaggerItem className="md:col-span-2">
          <BentoCard featured className="flex flex-col justify-between gap-8">
            <div>
              <span className="grid size-12 place-items-center rounded-2xl bg-success-soft text-success">
                <ListOrdered aria-hidden="true" className="size-6" />
              </span>
              <h2 className="mt-5 text-2xl">Smart waitlist</h2>
              <p className="mt-2 max-w-md text-base text-pretty text-muted-foreground">
                A full room ranks waiting children fairly, then promotes the next one when a seat
                opens.
              </p>
            </div>
            <div aria-hidden="true" className="flex items-center gap-2.5">
              {QUEUE_PLACES.map((place) => (
                <span
                  key={place}
                  className="relative grid size-12 place-items-center rounded-full border bg-background text-muted-foreground"
                >
                  <Baby className="size-5" />
                  <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {place}
                  </span>
                </span>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">ranked by priority score</span>
            </div>
          </BentoCard>
        </StaggerItem>

        <StaggerItem>
          <BentoCard>
            <span className="grid size-12 place-items-center rounded-2xl bg-info-soft text-info">
              <ShieldCheck aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-5 text-xl">Verified staff</h2>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              Admins create every sitter and driver account and verify it before they can take a
              booking.
            </p>
          </BentoCard>
        </StaggerItem>

        <StaggerItem>
          <BentoCard>
            <span className="grid size-12 place-items-center rounded-2xl bg-warning-soft text-warning">
              <Bus aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-5 text-xl">Supervised rides</h2>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              Request a car, van or bus for a booking. The driver starts and ends every trip.
            </p>
          </BentoCard>
        </StaggerItem>

        <StaggerItem className="md:col-span-2">
          <BentoCard featured className="flex flex-col justify-between gap-8">
            <div>
              <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
                <Wallet aria-hidden="true" className="size-6" />
              </span>
              <h2 className="mt-5 text-2xl">One wallet</h2>
              <p className="mt-2 max-w-md text-base text-pretty text-muted-foreground">
                Top up with bKash and pay for care and rides from a single balance.
              </p>
            </div>
            <p className="font-heading text-3xl tabular-nums sm:text-4xl">
              {TOP_UP_MIN_AMOUNT} – {TOP_UP_MAX_AMOUNT.toLocaleString('en-US')} BDT
              <span className="ml-3 font-sans text-sm text-muted-foreground">per top-up</span>
            </p>
          </BentoCard>
        </StaggerItem>
      </Stagger>
    </section>
  )
}
