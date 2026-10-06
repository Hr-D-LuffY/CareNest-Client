import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { BrandLogo } from '@/components/layout/brand-logo'
import { cn } from '@/lib/utils'

type ErrorScreenProps = {
  icon: LucideIcon
  // Small label above the title, e.g. "404".
  eyebrow?: string
  title: string
  description: string
  // The buttons or links.
  children: ReactNode
  // A short code the user can quote when reporting a problem (Next's error digest).
  reference?: string
  // Full-page (the root 404 and error pages have no navbar, so it shows the logo) or inside the
  // content area of a dashboard.
  fullPage?: boolean
}

// One look for every "nothing to show" state: 404 pages and error boundaries. Plain markup with no
// hooks, so both Server and Client Components can render it.
export function ErrorScreen({
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
  reference,
  fullPage = false,
}: ErrorScreenProps) {
  // Inside a dashboard the shell already has a <main>, so only the full page gets its own.
  const Body = fullPage ? 'main' : 'div'

  return (
    <div
      className={cn(
        'relative isolate flex flex-col items-center',
        fullPage ? 'min-h-dvh overflow-hidden' : 'py-12 sm:py-20',
      )}
    >
      {fullPage && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_10%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground)_10%,transparent)_1px,transparent_1px)] bg-size-[56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
          />
          <header className="page-container flex h-16 items-center">
            <BrandLogo />
          </header>
        </>
      )}

      <Body
        id={fullPage ? 'main-content' : undefined}
        className={cn(
          'flex w-full max-w-lg flex-col items-center gap-4 px-4 text-center',
          fullPage && 'flex-1 justify-center pb-24',
        )}
      >
        <span className="grid size-16 place-items-center rounded-3xl border bg-card text-info shadow-card">
          <Icon aria-hidden="true" className="size-8" />
        </span>
        {eyebrow && (
          <p className="text-sm font-semibold tracking-wide text-info uppercase">{eyebrow}</p>
        )}
        <h1 className="text-3xl text-balance sm:text-4xl">{title}</h1>
        <p className="text-base text-pretty text-muted-foreground">{description}</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">{children}</div>
        {reference && (
          <p className="mt-2 text-xs text-muted-foreground">
            Error reference: <span className="font-mono">{reference}</span>
          </p>
        )}
      </Body>
    </div>
  )
}
