import type { ReactNode } from 'react'
import { BrandLogo } from '@/components/layout/brand-logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'

// Shell for the login and sign-up pages: logo and theme toggle on top, the card centred over a
// faint grid.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]"
      />
      <header className="page-container relative flex h-16 items-center justify-between">
        <BrandLogo />
        <ThemeToggle />
      </header>
      <main
        id="main-content"
        className="relative flex flex-1 items-center justify-center px-4 py-8"
      >
        {children}
      </main>
    </div>
  )
}
