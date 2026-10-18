import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { AssistantLoader } from '@/features/assistant/components/assistant-loader'
import { requireSession } from '@/lib/auth/session'
import { SessionProvider } from '@/providers/session-provider'
import { Role } from '@/types/enums'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false },
}

// Guardian area. The session comes from the cookie on the server and is shared with every client
// component below through SessionProvider.
export default async function GuardianLayout({ children }: { children: ReactNode }) {
  const session = await requireSession(Role.GUARDIAN)
  return (
    <SessionProvider session={session}>
      <DashboardShell>
        {children}
        {/* Room at the end of every page, so the floating assistant button never covers the last row. */}
        <div aria-hidden="true" className="h-16" />
      </DashboardShell>
      <AssistantLoader />
    </SessionProvider>
  )
}
