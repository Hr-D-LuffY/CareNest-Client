import {
  Baby,
  Bus,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  Car,
  ClipboardList,
  DoorOpen,
  Info,
  LayoutDashboard,
  type LucideIcon,
  Mail,
  Route,
  ScrollText,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react'
import { matchesPrefix } from '@/lib/auth/routes'
import { Role, StaffType } from '@/types/enums'
import type { SessionUser } from '@/types/user'

// Navigation for the public navbar (PUBLIC_NAV) and the sidebar of each dashboard (DASHBOARD_NAV).

export type NavItem = {
  href: string
  label: string
  description?: string
  icon?: LucideIcon
}

export type NavEntry =
  | { type: 'link'; href: string; label: string }
  // 'description': label plus a short line. 'icon': label with an icon.
  | { type: 'menu'; label: string; layout: 'description' | 'icon'; items: readonly NavItem[] }

// The #anchors on /services are created with that page (commit #14).
export const PUBLIC_NAV: readonly NavEntry[] = [
  { type: 'link', href: '/', label: 'Home' },
  {
    type: 'menu',
    label: 'Services',
    layout: 'description',
    items: [
      {
        href: '/services#care-rooms',
        label: 'Care rooms',
        description: 'Browse rooms run by verified staff and book a seat.',
      },
      {
        href: '/services#waitlist',
        label: 'Smart waitlist',
        description: 'A full room ranks your child fairly and promotes them when a seat opens.',
      },
      {
        href: '/services#transport',
        label: 'Safe transport',
        description: 'Request a supervised ride tied to your booking.',
      },
      {
        href: '/services#wallet',
        label: 'Wallet',
        description: 'Top up with bKash and pay for care and rides.',
      },
    ],
  },
  {
    type: 'menu',
    label: 'About',
    layout: 'icon',
    items: [
      { href: '/about', label: 'About us', icon: Info },
      { href: '/contact', label: 'Contact', icon: Mail },
    ],
  },
]

export type DashboardNavItem = {
  href: string
  label: string
  icon: LucideIcon
  // The overview page matches only its own URL. Every other item also matches its sub-pages.
  exact?: boolean
  // Staff only: show the item to these staff types. Omitted means every staff member.
  staffTypes?: readonly StaffType[]
}

// One list per role. The sidebar shows the items the signed-in user may use (see getDashboardNav).
// Pages that are reached from a row rather than the sidebar (room waitlist, booking detail) are
// not listed.
export const DASHBOARD_NAV: Record<Role, readonly DashboardNavItem[]> = {
  [Role.GUARDIAN]: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/children', label: 'Children', icon: Baby },
    { href: '/dashboard/rooms', label: 'Care rooms', icon: DoorOpen },
    { href: '/dashboard/book', label: 'Book a seat', icon: CalendarPlus },
    { href: '/dashboard/bookings', label: 'Bookings', icon: CalendarCheck },
    { href: '/dashboard/transport', label: 'Transport', icon: Bus },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  ],
  [Role.STAFF]: [
    {
      href: '/staff',
      label: 'Tasks',
      icon: ClipboardList,
      exact: true,
      staffTypes: [StaffType.SITTER, StaffType.BOTH],
    },
    {
      href: '/staff/trips',
      label: 'Trips',
      icon: Route,
      staffTypes: [StaffType.DRIVER, StaffType.BOTH],
    },
    {
      href: '/staff/vehicles',
      label: 'Vehicles',
      icon: Car,
      staffTypes: [StaffType.DRIVER, StaffType.BOTH],
    },
    {
      href: '/staff/availability',
      label: 'Availability',
      icon: CalendarClock,
      // Only care rooms read availability (an admin can only assign a room inside the sitter's
      // hours). Rides never do, so a driver has no use for it.
      staffTypes: [StaffType.SITTER, StaffType.BOTH],
    },
    { href: '/staff/earnings', label: 'Earnings', icon: TrendingUp },
  ],
  [Role.ADMIN]: [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/admin/staff', label: 'Staff', icon: UserCog },
    { href: '/admin/rooms', label: 'Care rooms', icon: DoorOpen },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/audit-logs', label: 'Audit log', icon: ScrollText },
  ],
}

// The admin has no profile page: the account is seeded, not self-managed.
export const PROFILE_PATH: Partial<Record<Role, string>> = {
  [Role.GUARDIAN]: '/dashboard/profile',
  [Role.STAFF]: '/staff/profile',
}

// The sidebar items for this user: their role's list, minus staff pages for the other staff type
// (a SITTER never sees "Trips").
export function getDashboardNav(session: SessionUser): DashboardNavItem[] {
  return DASHBOARD_NAV[session.role].filter(
    (item) =>
      !item.staffTypes ||
      (session.staffType !== undefined && item.staffTypes.includes(session.staffType)),
  )
}

export function isNavItemActive(pathname: string, item: DashboardNavItem) {
  return item.exact ? pathname === item.href : matchesPrefix(pathname, item.href)
}
