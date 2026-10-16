import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { VerificationCard } from './verification-card'

const LINKS = [
  {
    title: 'Parents sign up themselves',
    text: 'Anyone can create a parent account in a minute.',
  },
  {
    title: 'Staff are created by an admin',
    text: 'There is no public staff sign-up. Every sitter and driver account is created by an admin.',
  },
  {
    title: 'Then they are verified',
    text: 'Staff upload a verification document, and an admin approves it before they can take a booking.',
  },
  {
    title: 'Everything leaves a trail',
    text: 'Each action is checked on the server, and admins can read an audit log of who did what.',
  },
] as const

// Replaces the old "who is behind it" tiles. The promise is told as a chain of four links down the
// left, with the staff verification playing out on a card to the right.
export function TrustChain() {
  return (
    <section id="who-is-behind" className="page-container scroll-mt-28 pt-10 pb-16 sm:pb-24">
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <Stagger className="relative flex flex-col" gap={0.12}>
          <span aria-hidden="true" className="absolute top-4 bottom-4 left-4 w-px bg-border" />
          {LINKS.map(({ title, text }, index) => (
            <StaggerItem key={title}>
              <div className="relative flex gap-5 pb-8 last:pb-0">
                <span
                  aria-hidden="true"
                  className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground ring-4 ring-background"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-xl">{title}</h3>
                  <p className="mt-1 text-base text-pretty text-muted-foreground">{text}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.15}>
          <VerificationCard />
        </Reveal>
      </div>
    </section>
  )
}
