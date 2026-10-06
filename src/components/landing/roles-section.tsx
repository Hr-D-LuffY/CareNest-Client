import { Check, ClipboardCheck, ShieldCheck, UsersRound } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BentoCard } from './bento-card'
import { SectionHeading } from './section-heading'

const GUARDIAN_POINTS = [
  'Add children and keep their details in one place',
  'Book a seat or join the waitlist',
  'Request rides and top up the wallet with bKash',
  'Rate sitters and drivers after a session',
] as const

const TEAM = [
  {
    icon: ClipboardCheck,
    title: 'Sitters and drivers',
    tone: 'bg-success-soft text-success',
    points: [
      'Check your child in and out of every session',
      'Start and end each supervised trip',
      'Keep their own availability and vehicles up to date',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Admins',
    tone: 'bg-warning-soft text-warning',
    points: [
      'Create and verify every staff account',
      'Manage care rooms and their waitlists',
      'Read the analytics and the audit log',
    ],
  },
] as const

function CheckList({ points }: { points: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-3 text-sm">
      {points.map((point) => (
        <li key={point} className="flex items-start gap-2.5">
          <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
          <span className="text-pretty">{point}</span>
        </li>
      ))}
    </ul>
  )
}

// Only guardians sign up. Staff accounts are created and verified by an admin, and admins are
// seeded, so there is no staff or admin sign-in to advertise here. This section shows what the
// guardian does and who looks after the rest, as a bento grid.
export function RolesSection() {
  return (
    <section id="team" className="page-container scroll-mt-20 pb-16 sm:pb-24">
      <Reveal>
        <SectionHeading
          eyebrow="Who is behind it"
          title="You book, a verified team looks after the rest"
          description="Guardians are the only people who sign up. Every sitter and driver is created and verified by an admin, and each action is checked on the server as well as in the interface."
        />
      </Reveal>

      <Stagger className="mt-12 grid gap-4 lg:grid-cols-3" gap={0.1}>
        <StaggerItem className="lg:col-span-2 lg:row-span-2">
          <BentoCard featured className="flex flex-col justify-between gap-8 lg:p-10">
            <div>
              <span className="grid size-12 place-items-center rounded-2xl bg-info-soft text-info">
                <UsersRound aria-hidden="true" className="size-6" />
              </span>
              <h3 className="mt-5 text-2xl">For guardians</h3>
              <p className="mt-1.5 max-w-md text-base text-pretty text-muted-foreground">
                Everything for your child&apos;s care day in one account.
              </p>
              <div className="mt-6 max-w-md">
                <CheckList points={GUARDIAN_POINTS} />
              </div>
            </div>
            <Link
              href="/register"
              className={cn(
                buttonVariants(),
                'h-12 w-full bg-cta px-6 text-base font-semibold text-cta-foreground hover:bg-cta/90 sm:w-fit',
              )}
            >
              Create a guardian account
            </Link>
          </BentoCard>
        </StaggerItem>

        {TEAM.map(({ icon: Icon, title, tone, points }) => (
          <StaggerItem key={title}>
            <BentoCard>
              <span className={cn('grid size-12 place-items-center rounded-2xl', tone)}>
                <Icon aria-hidden="true" className="size-6" />
              </span>
              <h3 className="mt-4 text-xl">{title}</h3>
              <div className="mt-4">
                <CheckList points={points} />
              </div>
            </BentoCard>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
