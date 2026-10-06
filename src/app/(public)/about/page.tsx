import { BadgeCheck, Calculator, Layers, Scale, ServerCog } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BentoCard } from '@/components/landing/bento-card'
import { SectionHeading } from '@/components/landing/section-heading'
import { SocialIcon } from '@/components/layout/social-icon'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { PageIntro } from '@/components/shared/page-intro'
import { buttonVariants } from '@/components/ui/button'
import { SITE_AUTHOR, SOCIAL_LINKS } from '@/lib/site-config'
import { cn } from '@/lib/utils'

const TITLE = 'About'
const DESCRIPTION =
  'CareNest brings childcare and supervised transport into one place: care rooms run by verified staff, a fair waitlist and one wallet.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: `${TITLE} | CareNest`, description: DESCRIPTION, type: 'website' },
}

const PRINCIPLES = [
  {
    icon: BadgeCheck,
    title: 'Trust comes first',
    text: 'Only an admin can create a sitter or driver account, and a room can only be given to a verified sitter. Guardians are the only people who sign up themselves.',
    tone: 'bg-info-soft text-info',
  },
  {
    icon: Scale,
    title: 'Fair when a room is full',
    text: 'A full room does not turn families away. The waitlist ranks children by how long they have waited, their care tier and recent cancellations, and promotes the next one automatically.',
    tone: 'bg-success-soft text-success',
  },
  {
    icon: Calculator,
    title: 'Money you can follow',
    text: 'The server works out every fee, so what you are shown is what is charged. Every top-up, care fee and ride fare appears in your wallet history.',
    tone: 'bg-warning-soft text-warning',
  },
] as const

const BUILT_WITH = [
  'Next.js and React on Vercel',
  'An Express and Prisma API on Render',
  'PostgreSQL for the data',
  'bKash (sandbox) for wallet top-ups',
] as const

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About CareNest"
        title="Childcare and the ride to it, in one place"
        description="Looking after a child usually means juggling a care room, a way to get there and a way to pay. CareNest puts all three in one account, with verified people at every step."
      />

      <section className="page-container py-12 sm:py-16">
        <Stagger className="grid gap-4 md:grid-cols-3" gap={0.1}>
          {PRINCIPLES.map(({ icon: Icon, title, text, tone }) => (
            <StaggerItem key={title}>
              <BentoCard>
                <span className={cn('grid size-12 place-items-center rounded-2xl', tone)}>
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <h2 className="mt-5 text-xl">{title}</h2>
                <p className="mt-2 text-sm text-pretty text-muted-foreground">{text}</p>
              </BentoCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="border-y bg-card/50 py-12 sm:py-16">
        <div className="page-container grid gap-6 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="How it is built"
              title="A full-stack project, built end to end"
              description="CareNest is a complete web application with its own backend. Roles are checked in the interface and again on the server."
              align="start"
            />
            <ul className="mt-6 flex flex-col gap-3 text-sm">
              {BUILT_WITH.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                    <Layers aria-hidden="true" className="size-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <BentoCard featured className="flex h-full flex-col justify-between gap-8">
              <div>
                <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
                  <ServerCog aria-hidden="true" className="size-6" />
                </span>
                <h2 className="mt-5 text-2xl">Made by {SITE_AUTHOR}</h2>
                <p className="mt-2 text-base text-pretty text-muted-foreground">
                  Designed, built and deployed by one developer. Payments run on the bKash sandbox,
                  so no real money moves.
                </p>
              </div>
              {SOCIAL_LINKS.length > 0 && (
                <ul className="flex items-center gap-3">
                  {SOCIAL_LINKS.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        aria-label={`${link.label} (opens in a new tab)`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <SocialIcon id={link.id} className="size-5" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </BentoCard>
          </Reveal>
        </div>
      </section>

      <section className="page-container py-12 sm:py-16">
        <Reveal>
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="max-w-xl text-3xl text-balance sm:text-4xl">See it for yourself</h2>
            <p className="max-w-xl text-base text-pretty text-muted-foreground">
              Create a guardian account, or use a one-click demo account to explore every role.
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
