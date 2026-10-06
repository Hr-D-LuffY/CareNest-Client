import { Baby, CalendarCheck, Check, Clock, DoorOpen, Star } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { BentoCard } from './bento-card'
import { SectionHeading } from './section-heading'

function StepNumber({ value }: { value: number }) {
  return (
    <span
      aria-hidden="true"
      className="absolute top-5 right-6 font-heading text-5xl text-muted-foreground/30 tabular-nums"
    >
      {String(value).padStart(2, '0')}
    </span>
  )
}

// Four steps as a bento grid: step 3 (the booking outcome, the product's key moment) is the tall
// tile, step 4 is the wide one.
export function HowItWorks() {
  return (
    <section id="how-it-works" className="page-container scroll-mt-20 py-16 sm:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="How it works"
          title="From first booking to the ride home"
          description="Four steps, and the app does the arithmetic and the queueing for you."
        />
      </Reveal>

      <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.1}>
        <StaggerItem>
          <BentoCard>
            <StepNumber value={1} />
            <span className="grid size-12 place-items-center rounded-2xl bg-info-soft text-info">
              <Baby aria-hidden="true" className="size-6" />
            </span>
            <h3 className="mt-5 text-lg">
              <span className="sr-only">Step 1: </span>
              Add your child
            </h3>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              Name, date of birth, care tier, allergies and an emergency contact, kept in one place.
            </p>
          </BentoCard>
        </StaggerItem>

        <StaggerItem>
          <BentoCard>
            <StepNumber value={2} />
            <span className="grid size-12 place-items-center rounded-2xl bg-success-soft text-success">
              <DoorOpen aria-hidden="true" className="size-6" />
            </span>
            <h3 className="mt-5 text-lg">
              <span className="sr-only">Step 2: </span>
              Choose a room and a date
            </h3>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              Browse care rooms run by verified staff and pick a session date that matches the
              room&apos;s day.
            </p>
          </BentoCard>
        </StaggerItem>

        <StaggerItem className="sm:col-span-2 lg:col-span-1 lg:row-span-2">
          <BentoCard featured className="flex flex-col justify-between gap-8">
            <StepNumber value={3} />
            <div>
              <span className="grid size-12 place-items-center rounded-2xl bg-warning-soft text-warning">
                <CalendarCheck aria-hidden="true" className="size-6" />
              </span>
              <h3 className="mt-5 text-2xl">
                <span className="sr-only">Step 3: </span>
                Book, or join the waitlist
              </h3>
              <p className="mt-2 text-base text-pretty text-muted-foreground">
                A free seat is confirmed with its estimated fee. A full room puts your child on the
                waitlist with a priority score.
              </p>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm font-medium">
              <li className="flex items-center gap-2.5 rounded-2xl bg-success-soft px-4 py-3 text-success">
                <Check aria-hidden="true" className="size-4 shrink-0" strokeWidth={3} />
                Seat free: confirmed, with the estimated fee
              </li>
              <li className="flex items-center gap-2.5 rounded-2xl bg-warning-soft px-4 py-3 text-warning">
                <Clock aria-hidden="true" className="size-4 shrink-0" strokeWidth={3} />
                Room full: waitlisted, with a priority score
              </li>
            </ul>
          </BentoCard>
        </StaggerItem>

        <StaggerItem className="sm:col-span-2">
          <BentoCard className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <StepNumber value={4} />
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
              <Star aria-hidden="true" className="size-6" />
            </span>
            <div className="sm:pr-16">
              <h3 className="text-lg">
                <span className="sr-only">Step 4: </span>
                Check in, ride and rate
              </h3>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">
                Staff check your child in and out. Add a supervised ride to a booking, then rate
                your sitter or driver.
              </p>
            </div>
          </BentoCard>
        </StaggerItem>
      </Stagger>
    </section>
  )
}
