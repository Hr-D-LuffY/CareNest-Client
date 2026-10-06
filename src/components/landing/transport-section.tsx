import { CalendarCheck, Car, Timer } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { RouteScene } from './route-scene'
import { SectionHeading } from './section-heading'

const POINTS = [
  {
    icon: CalendarCheck,
    title: 'Tied to your booking',
    text: 'A ride belongs to a booking you already hold, so the driver always knows which child and which session.',
  },
  {
    icon: Car,
    title: 'Car, van or bus',
    text: 'Pick from the vehicles drivers have registered, then enter the pickup and drop-off addresses.',
  },
  {
    icon: Timer,
    title: 'A fair, exact fare',
    text: "The driver starts and ends the trip. The fare is the base fare plus the minutes driven at the driver's per-minute rate, taken from your wallet when the trip ends.",
  },
] as const

export function TransportSection() {
  return (
    <section id="transport" className="page-container scroll-mt-20 py-16 sm:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <RouteScene />
        </Reveal>

        <div className="order-1 flex flex-col gap-8 lg:order-2">
          <Reveal>
            <SectionHeading
              eyebrow="Safe transport"
              title="A supervised ride, door to care room"
              description="Add a ride to any active booking and follow it from request to the end of the trip."
              align="start"
            />
          </Reveal>
          <Stagger className="flex flex-col gap-4" gap={0.1}>
            {POINTS.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title}>
                <div className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-base">{title}</h3>
                    <p className="mt-0.5 text-sm text-pretty text-muted-foreground">{text}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  )
}
