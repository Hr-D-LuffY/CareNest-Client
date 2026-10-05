import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type AuthMode = 'login' | 'register'

type AuthCardProps = {
  mode: AuthMode
  // The page the user was sent here from. Kept when they switch between the two tabs.
  redirect?: string
  children: ReactNode
}

// Shell shared by the login and sign-up pages: heading, the Log In / Sign Up switch, the content.
export function AuthCard({ mode, redirect, children }: AuthCardProps) {
  const query = redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''
  const tabs = [
    { mode: 'login', href: `/login${query}`, label: 'Log In' },
    { mode: 'register', href: `/register${query}`, label: 'Sign Up' },
  ] as const

  return (
    <div className="flex w-full max-w-[440px] flex-col gap-5">
      <div className="rounded-2xl border bg-card p-6 shadow-float sm:p-8">
        <h1 className="text-3xl">Welcome</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log in or create an account</p>

        <nav
          aria-label="Account"
          className="mt-6 grid grid-cols-2 gap-1 rounded-xl border bg-background p-1"
        >
          {tabs.map((tab) => {
            const active = tab.mode === mode
            return (
              <Link
                key={tab.mode}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'grid h-10 place-items-center rounded-lg border text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
                  active
                    ? 'border-border bg-card text-foreground shadow-soft'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-6">{children}</div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Need help?{' '}
        <Link
          href="/contact"
          className="rounded-sm font-medium text-foreground outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Contact support
        </Link>
      </p>
    </div>
  )
}
