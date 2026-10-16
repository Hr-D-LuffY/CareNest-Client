import { Baby, CalendarCheck, DoorOpen, type LucideIcon, Star } from 'lucide-react'
import { SectionHeading } from '@/components/landing/section-heading'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'

const STEPS: readonly { icon: LucideIcon; title: string; text: string; tone: string }[] = [
  {
    icon: Baby,
    title: 'Add your child',
    text: 'Name, date of birth, care tier, allergies and an emergency contact, kept in one place.',
    tone: 'bg-info-soft text-info',
  },
  {
    icon: DoorOpen,
    title: 'Choose a room and a date',
    text: 'Browse care rooms run by verified staff and pick a session date that matches the room’s day.',
    tone: 'bg-success-soft text-success',
  },
  {
    icon: CalendarCheck,
    title: 'Book, or join the waitlist',
    text: 'A free seat is confirmed with its estimated fee. A full room puts your child on the waitlist with a priority score.',
    tone: 'bg-warning-soft text-warning',
  },
  {
    icon: Star,
    title: 'Check in, ride and rate',
    text: 'Staff check your child in and out. Add a supervised ride to a booking, then rate your sitter or driver.',
    tone: 'bg-secondary text-secondary-foreground',
  },
]

// A horizontal timeline on wide screens and a vertical one on phones. A line runs through the
// numbered markers, so the order of the steps is the layout. No cards.
// `withHeading` is off when a chapter intro above already introduces the section.
export function BookingTimeline({
  withHeading = true,
  anchorId = 'how-it-works',
}: {
  withHeading?: boolean
  anchorId?: string
}) {
  return (
    <section id={anchorId} className="page-container scroll-mt-20 py-16 sm:py-24">
      {withHeading && (
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="From first booking to the ride home"
            description="Four steps for a parent. The app does the arithmetic and the queueing."
          />
        </Reveal>
      )}

      <Stagger
        className={`relative grid ${withHeading ? 'mt-14' : ''} gap-10 lg:grid-cols-4 lg:gap-6`}
        gap={0.12}
      >
        {/* Phones: one vertical line behind the markers. Wide screens draw a connector per step. */}
        <div
          aria-hidden="true"
          className="absolute top-6 bottom-6 left-6 w-px bg-border lg:hidden"
        />
        {STEPS.map(({ icon: Icon, title, text, tone }, index) => (
          <StaggerItem key={title} className="relative flex gap-5 lg:flex-col lg:gap-5">
            {index < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute top-6 right-[-1.5rem] left-14 hidden h-px bg-border lg:block"
              />
            )}
            <span
              className={`relative z-10 grid size-12 shrink-0 place-items-center rounded-full border-4 border-background ${tone}`}
            >
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Step {index + 1}
              </p>
              <h3 className="mt-1 text-xl text-balance">{title}</h3>
              <p className="mt-2 text-sm text-pretty text-muted-foreground sm:text-base lg:text-sm">
                {text}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
