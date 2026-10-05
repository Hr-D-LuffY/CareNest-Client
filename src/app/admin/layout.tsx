import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { requireSession } from '@/lib/auth/session'
import { SessionProvider } from '@/providers/session-provider'
import { Role } from '@/types/enums'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false },
}

// Admin area.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireSession(Role.ADMIN)
  return (
    <SessionProvider session={session}>
      <DashboardShell>{children}</DashboardShell>
    </SessionProvider>
  )
}
