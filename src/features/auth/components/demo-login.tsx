'use client'

import { Baby, Car, HeartHandshake, Loader2, type LucideIcon, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDemoLoginMutation } from '../auth.queries'
import { DEMO_ROLE_LABEL, DEMO_ROLES, type DemoRole } from '../demo-roles'

const DEMO_ROLE_META: Record<DemoRole, { icon: LucideIcon; description: string }> = {
  GUARDIAN: { icon: HeartHandshake, description: 'Book care and rides' },
  SITTER: { icon: Baby, description: 'Check children in and out' },
  DRIVER: { icon: Car, description: 'Run trips and vehicles' },
  ADMIN: { icon: ShieldCheck, description: 'Manage the platform' },
}

type DemoLoginProps = {
  // Roles whose demo account is configured on the server. The others are shown but disabled.
  availableRoles: readonly DemoRole[]
  redirect: string | undefined
}

// A boxed list of one-click demo accounts. The browser only sends the role: the credentials are
// looked up on the server, so no password is ever in the page.
export function DemoLogin({ availableRoles, redirect }: DemoLoginProps) {
  const demo = useDemoLoginMutation(redirect)
  const busy = demo.isPending || demo.isSuccess

  return (
    <section
      aria-labelledby="demo-login-heading"
      className="rounded-xl border bg-muted/40 p-3 sm:p-4"
    >
      <h2 id="demo-login-heading" className="text-base">
        Demo accounts
      </h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Try CareNest in one click. No sign-up needed.
      </p>

      <ul className="mt-3 grid grid-cols-2 gap-2">
        {DEMO_ROLES.map((role) => {
          const { icon: Icon, description } = DEMO_ROLE_META[role]
          const configured = availableRoles.includes(role)
          const loading = demo.isPending && demo.variables === role
          return (
            <li key={role} className="flex">
              <button
                type="button"
                disabled={busy || !configured}
                onClick={() => demo.mutate(role)}
                className={cn(
                  'flex h-full w-full flex-col gap-1.5 rounded-lg border bg-card p-2.5 text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-3',
                  'enabled:hover:border-ring/50 enabled:hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60',
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground sm:size-8">
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Icon className="size-4" aria-hidden="true" />
                    )}
                  </span>
                  <span className="truncate text-sm font-semibold">{DEMO_ROLE_LABEL[role]}</span>
                </span>
                <span className="text-xs leading-snug text-muted-foreground">
                  {configured ? description : 'Not set up yet'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
