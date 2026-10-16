'use client'

import { Tabs } from '@base-ui/react/tabs'
import { Check, ClipboardCheck, type LucideIcon, ShieldCheck, UsersRound } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { DASHBOARD_NAV } from '@/components/layout/nav-config'
import { buttonVariants } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'
import { Role } from '@/types/enums'

type RoleTab = {
  value: string
  role: Role
  label: string
  icon: LucideIcon
  tone: string
  summary: string
  note: string
}

const ROLES: readonly RoleTab[] = [
  {
    value: 'parents',
    role: Role.GUARDIAN,
    label: 'Parents and guardians',
    icon: UsersRound,
    tone: 'bg-info-soft text-info',
    summary: 'Book care for your children and pay for it.',
    note: 'You sign up yourself and get a dashboard for your family.',
  },
  {
    value: 'staff',
    role: Role.STAFF,
    label: 'Sitters and drivers',
    icon: ClipboardCheck,
    tone: 'bg-success-soft text-success',
    summary: 'Run the care day and the rides.',
    note: 'An admin creates and verifies your account. You see the pages for your job: sitters get tasks and waitlists, drivers get trips and vehicles.',
  },
  {
    value: 'admins',
    role: Role.ADMIN,
    label: 'Daycare admins',
    icon: ShieldCheck,
    tone: 'bg-warning-soft text-warning',
    summary: 'Oversee people, rooms and records.',
    note: 'Admin accounts are set up by the platform, not by sign-up.',
  },
]

const EASE_OUT = [0.22, 1, 0.36, 1] as const

// "Who is it for", as tabs: pick who you are and see the real pages that account gets (the same
// list as the sidebar in the app). The left list slides a marker to the active tab, and the panel
// fades in with its items one after another.
export function RoleTabs() {
  const reduce = usePrefersReducedMotion()

  return (
    <Tabs.Root
      defaultValue="parents"
      orientation="vertical"
      className="grid gap-6 lg:grid-cols-[2fr_3fr]"
    >
      <Tabs.List className="relative flex flex-col gap-2" aria-label="Choose who you are">
        <Tabs.Indicator className="absolute top-(--active-tab-top) left-0 h-(--active-tab-height) w-1.5 rounded-full bg-primary transition-[top,height] duration-300 ease-out motion-reduce:transition-none" />
        {ROLES.map(({ value, label, icon: Icon, tone, summary }) => (
          <Tabs.Tab
            key={value}
            value={value}
            className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-transparent py-4 pr-4 pl-6 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 data-active:border-border data-active:bg-card data-active:shadow-soft"
          >
            <span
              className={cn(
                'grid size-12 shrink-0 place-items-center rounded-2xl transition-transform duration-300 group-data-active:scale-105',
                tone,
              )}
            >
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <span>
              <span className="block font-heading text-lg">{label}</span>
              <span className="block text-sm text-muted-foreground">{summary}</span>
            </span>
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {ROLES.map(({ value, role, label, note }) => (
        <Tabs.Panel
          key={value}
          value={value}
          className="outline-none lg:col-start-2 lg:row-start-1"
        >
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.4, ease: EASE_OUT }}
            className="h-full rounded-3xl border bg-card p-6 shadow-card sm:p-8"
          >
            <p className="text-sm font-semibold tracking-wide text-info uppercase">
              What {label.toLowerCase()} get
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {DASHBOARD_NAV[role].map(({ href, label: itemLabel, icon: ItemIcon }, index) => (
                <motion.li
                  key={href}
                  initial={{ opacity: 0, x: reduce ? 0 : -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : 0.08 * index }}
                  className="flex items-center gap-3 rounded-2xl border bg-background px-4 py-3 text-base font-medium"
                >
                  <ItemIcon aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
                  {itemLabel}
                </motion.li>
              ))}
            </ul>
            <p className="mt-6 flex items-start gap-2.5 text-sm text-pretty text-muted-foreground">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
              {note}
            </p>
            {role === Role.GUARDIAN && (
              <Link
                href="/register"
                className={cn(
                  buttonVariants(),
                  'mt-6 h-12 w-full bg-cta px-6 text-base font-semibold text-cta-foreground hover:bg-cta/90 sm:w-fit',
                )}
              >
                Create a parent account
              </Link>
            )}
          </motion.div>
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  )
}
