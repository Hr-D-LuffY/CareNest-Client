import {
  Bus,
  DoorOpen,
  ListOrdered,
  type LucideIcon,
  ShieldCheck,
  UserRoundCheck,
  Wallet,
} from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'

const PARTS: readonly { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: DoorOpen,
    title: 'Care rooms',
    text: 'Each room has a weekday, a time window, a number of seats and a verified sitter. Parents see how many seats are left before they book.',
  },
  {
    icon: UserRoundCheck,
    title: 'Check-in and check-out',
    text: 'Sitters check every child in and out of a session, so the care fee is worked out from the real time in the room.',
  },
  {
    icon: ListOrdered,
    title: 'Smart waitlist',
    text: 'A full room does not turn anyone away. Waiting children are ranked fairly, and a cancellation promotes the next one automatically.',
  },
  {
    icon: Bus,
    title: 'Supervised transport',
    text: 'A parent adds a ride to a booking. A driver starts and ends the trip, and the fare is worked out from the minutes driven.',
  },
  {
    icon: Wallet,
    title: 'Wallet and payments',
    text: 'Parents top up with bKash and pay for care and rides from one balance. Every movement is kept in a history.',
  },
  {
    icon: ShieldCheck,
    title: 'Staff and records',
    text: 'The daycare’s admins create and verify every sitter and driver, manage the rooms, and read the analytics and the audit log.',
  },
]

// The plain answer to "what is this?": CareNest is a daycare platform, and the text says so in full.
// An editorial two-column layout with a divided list instead of cards: the heading stays in view on
// wide screens while the six parts of a daycare scroll past.
export function WhatIsCareNest() {
  return (
    <section id="what-is-carenest" className="page-container scroll-mt-20 py-16 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-36 lg:self-start">
          <p className="text-sm font-semibold tracking-wide text-info uppercase">
            What is CareNest
          </p>
          <h2 className="mt-3 text-3xl text-balance sm:text-4xl">CareNest is a daycare platform</h2>
          <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">
            It is one place where a daycare, the families who use it and the people who work there
            run the care day together. The daycare sets up its rooms and its team. Families book a
            seat for their child, arrange a ride and pay. Sitters and drivers check children in and
            out and look after them.
          </p>
          <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">
            Where a daycare would otherwise juggle phone calls, paper registers and cash, CareNest
            keeps the whole routine online: who has a seat, who is looking after the children, how
            they get there and who has paid.
          </p>
        </Reveal>

        <Stagger className="divide-y border-y" gap={0.08}>
          {PARTS.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title}>
              <div className="flex gap-5 py-6 sm:py-7">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h3 className="text-xl">{title}</h3>
                  <p className="mt-1.5 text-base text-pretty text-muted-foreground">{text}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
