import { Baby, Bus, CalendarCheck, type LucideIcon, Wallet } from 'lucide-react'
import Link from 'next/link'
import type { GuardianOverview } from '@/features/guardian/guardian.server'
import { formatBDT } from '@/lib/format'

// Four headline numbers in one strip, each a link to where it comes from. A number that could not
// be loaded shows a dash.
export function AtAGlance({ overview }: { overview: GuardianOverview }) {
  const { profile, childCount, upcoming, activeRideCount } = overview
  const balance = profile.ok ? profile.data.guardianProfile.walletBalance : null

  const items: { icon: LucideIcon; label: string; value: string; href: string }[] = [
    {
      icon: Wallet,
      label: 'Wallet balance',
      value: balance === null ? '—' : formatBDT(balance),
      href: '/dashboard/wallet',
    },
    {
      icon: Baby,
      label: 'Children',
      value: childCount.ok ? String(childCount.data) : '—',
      href: '/dashboard/children',
    },
    {
      icon: CalendarCheck,
      label: 'Upcoming sessions',
      value: upcoming.ok ? String(upcoming.data.total) : '—',
      href: '/dashboard/bookings',
    },
    {
      icon: Bus,
      label: 'Active rides',
      value: activeRideCount.ok ? String(activeRideCount.data) : '—',
      href: '/dashboard/transport',
    },
  ]

  return (
    <section aria-label="At a glance">
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border shadow-soft lg:grid-cols-4">
        {items.map(({ icon: Icon, label, value, href }) => (
          <li key={label} className="bg-card">
            <Link
              href={href}
              className="flex items-center gap-3 p-4 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
            >
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-info-soft text-info"
              >
                <Icon className="size-5" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-heading text-xl tabular-nums">{value}</span>
                <span className="truncate text-xs text-muted-foreground">{label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
