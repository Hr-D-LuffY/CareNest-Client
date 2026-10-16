import { Reveal } from '@/components/motion/reveal'
import { BookingJourney } from './booking-journey'

// Closes the "how it works" chapter on a tinted band: the four steps above get a parent started,
// and here one booking is followed all the way through, from three points of view.
export function JourneySection() {
  return (
    <section
      id="the-journey"
      aria-labelledby="journey-heading"
      className="scroll-mt-28 border-y bg-card/50 py-16 sm:py-24"
    >
      <div className="page-container">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-info uppercase">
            And then, the day itself
          </p>
          <h3 id="journey-heading" className="mt-3 text-3xl text-balance sm:text-4xl">
            Follow one booking from first click to last rating
          </h3>
          <p className="mt-3 text-base text-pretty text-muted-foreground sm:text-lg">
            Pick a stage, or just watch: the booking moves along while you see what the parent, the
            sitter or driver and the admin each see.
          </p>
        </Reveal>
        <Reveal className="mt-12" delay={0.1}>
          <BookingJourney />
        </Reveal>
      </div>
    </section>
  )
}
