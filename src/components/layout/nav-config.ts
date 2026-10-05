import { Info, type LucideIcon, Mail } from 'lucide-react'

// Navigation for the public navbar. Dashboard sidebar items for each role join this file in
// commit #10.

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
