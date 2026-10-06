import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { requireSession } from '@/lib/auth/session'
import { SessionProvider } from '@/providers/session-provider'
import { Role } from '@/types/enums'

export const metadata: Metadata = {
  title: 'Payment',
  robots: { index: false },
}

// The bKash return pages belong to the guardian who is topping up, so they sit inside the guardian
// shell (sidebar and top bar), like the dashboard pages.
export default async function PaymentLayout({ children }: { children: ReactNode }) {
  const session = await requireSession(Role.GUARDIAN)
  return (
    <SessionProvider session={session}>
      <DashboardShell>{children}</DashboardShell>
    </SessionProvider>
  )
}
