import type { Metadata } from 'next'
import { Reveal } from '@/components/motion/reveal'
import { SectionError } from '@/components/shared/section-error'
import { AtAGlance } from '@/features/guardian/components/at-a-glance'
import { GettingStarted } from '@/features/guardian/components/getting-started'
import { GoodToKnow } from '@/features/guardian/components/good-to-know'
import { RecentActivity } from '@/features/guardian/components/recent-activity'
import { WeekStrip } from '@/features/guardian/components/week-strip'
import { WelcomeBanner } from '@/features/guardian/components/welcome-banner'
import { getGuardianOverview } from '@/features/guardian/guardian.server'
import { getSession } from '@/lib/auth/session'

export const metadata: Metadata = { title: 'Overview' }

// A balance string such as "0" or "0.00" is "no money". Compared, never added.
function hasFunds(balance: string) {
  return Number(balance) > 0
}

// The guardian's home: a welcome with the wallet, the setup checklist for a new guardian, four
// headline numbers, the next seven days, recent wallet activity and a few tips. Every section loads
// independently, so one failing endpoint shows an inline message instead of taking the page down.
export default async function GuardianOverviewPage() {
  const [overview, session] = await Promise.all([getGuardianOverview(), getSession()])
  const { profile, childCount, bookingCount, transactions, upcoming } = overview

  const firstName = (profile.ok ? profile.data.name : session?.name)?.trim().split(/\s+/)[0]

  // The checklist needs three facts. If any of them could not be loaded, it stays hidden rather
  // than telling a guardian who has already booked that they have not.
  const steps =
    profile.ok && childCount.ok && bookingCount.ok && transactions.ok
      ? [
          {
            id: 'child',
            title: 'Add your child',
            description:
              'Name, date of birth and emergency contact, so staff know who they are caring for.',
            href: '/dashboard/children',
            action: 'Add a child',
            done: childCount.data > 0,
          },
          {
            id: 'wallet',
            title: 'Top up your wallet',
            description:
              'Pay securely with bKash. Care fees and rides are taken from your balance.',
            href: '/dashboard/wallet',
            action: 'Top up wallet',
            done:
              hasFunds(profile.data.guardianProfile.walletBalance) || transactions.data.length > 0,
          },
          {
            id: 'booking',
            title: 'Book your first seat',
            description:
              'Pick a care room and a day. If it is full, your child joins the waitlist.',
            href: '/dashboard/book',
            action: 'Book a seat',
            done: bookingCount.data > 0,
          },
        ]
      : null
  const showChecklist = steps?.some((step) => !step.done) ?? false

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <WelcomeBanner overview={overview} firstName={firstName} />
      </Reveal>

      {showChecklist && steps && (
        <Reveal>
          <GettingStarted steps={steps} />
        </Reveal>
      )}

      <Reveal>
        <AtAGlance overview={overview} />
      </Reveal>

      <Reveal>
        <WeekStrip upcoming={upcoming} />
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          {transactions.ok ? (
            <RecentActivity transactions={transactions.data} />
          ) : (
            <SectionError title="Your recent wallet activity" />
          )}
        </Reveal>
        <Reveal className="lg:col-span-2" delay={0.08}>
          <GoodToKnow />
        </Reveal>
      </div>
    </div>
  )
}
