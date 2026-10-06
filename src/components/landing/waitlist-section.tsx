import { Clock, Layers, RotateCcw } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { BentoCard } from './bento-card'
import { SectionHeading } from './section-heading'
import { WaitlistBars } from './waitlist-bars'

const FACTORS = [
  {
    icon: Clock,
    title: 'Waiting longer ranks higher',
    text: 'Every hour on the waitlist adds to your priority, so the longest wait is looked after first.',
    tone: 'bg-info-soft text-info',
  },
  {
    icon: Layers,
    title: 'Longer plans rank higher',
    text: 'A Monthly child counts for more than a Weekly one, and Weekly counts for more than Daily.',
    tone: 'bg-success-soft text-success',
  },
  {
    icon: RotateCcw,
    title: 'Late cancellations count against you',
    text: 'Recent cancellations lower your score a little, so seats are not held and dropped.',
    tone: 'bg-warning-soft text-warning',
  },
] as const

// The headline feature of the backend, explained with its real formula and a worked example. The
// worked example is the big tile; the three ranking factors are the small ones beside it.
export function WaitlistSection() {
  return (
    <section id="waitlist" className="scroll-mt-20 border-y bg-card/50 py-16 sm:py-24">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Smart waitlist"
            title="A full room is not a dead end"
            description="When every seat is taken, your booking still goes through as a waitlist place. A cancellation promotes the child at the top of the queue, with no refreshing and no phone calls."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-5">
          <Reveal className="lg:col-span-3 lg:row-span-3">
            <WaitlistBars />
          </Reveal>

          {FACTORS.map(({ icon: Icon, title, text, tone }) => (
            <Stagger key={title} className="lg:col-span-2">
              <StaggerItem className="h-full">
                <BentoCard className="flex gap-4">
                  <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tone}`}>
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <div>
                    <h3 className="text-base">{title}</h3>
                    <p className="mt-1 text-sm text-pretty text-muted-foreground">{text}</p>
                  </div>
                </BentoCard>
              </StaggerItem>
            </Stagger>
          ))}
        </div>
      </div>
    </section>
  )
}
