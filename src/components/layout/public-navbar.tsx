'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { AuthActions } from './auth-actions'
import { BrandLogo } from './brand-logo'
import { type NavEntry, type NavItem, PUBLIC_NAV } from './nav-config'

function isActive(pathname: string, href: string) {
  const path = href.split('#')[0] || '/'
  return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`)
}

function isEntryActive(pathname: string, entry: NavEntry) {
  return entry.type === 'link'
    ? isActive(pathname, entry.href)
    : entry.items.some((item) => isActive(pathname, item.href))
}

// Plain muted text that brightens on hover. The current section is marked by colour and underline,
// not a filled pill.
function topLevelClass(active: boolean) {
  return cn(
    'h-9 rounded-lg bg-transparent px-3 text-sm font-medium outline-none transition-colors',
    'hover:bg-transparent hover:text-primary focus:bg-transparent focus-visible:ring-3 focus-visible:ring-ring/50',
    'data-active:bg-transparent data-active:hover:bg-transparent data-active:focus:bg-transparent',
    'data-open:bg-transparent data-open:text-primary data-open:hover:bg-transparent data-popup-open:bg-transparent data-popup-open:text-primary data-popup-open:hover:bg-transparent',
    active
      ? 'text-foreground underline decoration-primary decoration-2 underline-offset-8'
      : 'text-muted-foreground',
  )
}

function DropdownItem({ item, layout }: { item: NavItem; layout: 'description' | 'icon' }) {
  const Icon = item.icon
  return (
    <NavigationMenuLink
      render={<Link href={item.href} />}
      className={cn('p-3', layout === 'description' ? 'flex-col items-start gap-1' : 'gap-3')}
    >
      {layout === 'icon' && Icon && <Icon className="text-muted-foreground" aria-hidden="true" />}
      <span className="font-medium">{item.label}</span>
      {layout === 'description' && item.description && (
        <span className="text-sm leading-snug text-muted-foreground">{item.description}</span>
      )}
    </NavigationMenuLink>
  )
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <NavigationMenu className="max-md:hidden" aria-label="Main">
      <NavigationMenuList className="gap-1">
        {PUBLIC_NAV.map((entry) => {
          const active = isEntryActive(pathname, entry)
          if (entry.type === 'link') {
            return (
              <NavigationMenuItem key={entry.label}>
                <NavigationMenuLink
                  render={<Link href={entry.href} />}
                  active={active}
                  className={cn('inline-flex items-center', topLevelClass(active))}
                >
                  {entry.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          }
          return (
            <NavigationMenuItem key={entry.label}>
              <NavigationMenuTrigger className={topLevelClass(active)}>
                {entry.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul
                  className={cn(
                    'grid gap-1 p-2',
                    entry.layout === 'description'
                      ? 'w-[min(34rem,calc(100vw-2rem))] sm:grid-cols-2'
                      : 'w-56',
                  )}
                >
                  {entry.items.map((item) => (
                    <li key={item.href}>
                      <DropdownItem item={item} layout={entry.layout} />
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function MobileLink({
  item,
  pathname,
  onNavigate,
}: {
  item: { href: string; label: string }
  pathname: string
  onNavigate: () => void
}) {
  const active = isActive(pathname, item.href)
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-11 items-center rounded-lg px-3 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {item.label}
    </Link>
  )
}

function MobileNav({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <nav aria-label="Mobile">
      <ul className="flex flex-col gap-1">
        {PUBLIC_NAV.map((entry) =>
          entry.type === 'link' ? (
            <li key={entry.label}>
              <MobileLink item={entry} pathname={pathname} onNavigate={onNavigate} />
            </li>
          ) : (
            <li key={entry.label} className="mt-1">
              <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">{entry.label}</p>
              <ul aria-label={entry.label} className="flex flex-col gap-1">
                {entry.items.map((item) => (
                  <li key={item.href}>
                    <MobileLink item={item} pathname={pathname} onNavigate={onNavigate} />
                  </li>
                ))}
              </ul>
            </li>
          ),
        )}
      </ul>
    </nav>
  )
}

// Three bars that morph into an X while the menu is open (aria-expanded comes from the popover).
function MenuIcon() {
  const bar =
    'origin-center transition-all duration-300 ease-out motion-reduce:transition-none group-aria-expanded:translate-y-0'
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className="pointer-events-none"
    >
      <path d="M4 12H20" className={cn(bar, '-translate-y-[7px] group-aria-expanded:rotate-45')} />
      <path d="M4 12H20" className={cn(bar, 'group-aria-expanded:opacity-0')} />
      <path d="M4 12H20" className={cn(bar, 'translate-y-[7px] group-aria-expanded:-rotate-45')} />
    </svg>
  )
}

export function PublicNavbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-8">
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="group size-11 md:hidden"
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                />
              }
            >
              <MenuIcon />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 gap-3 p-2 md:hidden">
              <MobileNav pathname={pathname} onNavigate={closeMenu} />
              <Separator />
              <AuthActions stacked onNavigate={closeMenu} />
            </PopoverContent>
          </Popover>

          <BrandLogo />
          <DesktopNav pathname={pathname} />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthActions />
        </div>
      </div>
    </header>
  )
}
