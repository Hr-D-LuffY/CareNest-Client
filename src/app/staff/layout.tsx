import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { getMyStaffProfile } from '@/features/staff/staff.server'
import { requireSession } from '@/lib/auth/session'
import { SessionProvider } from '@/providers/session-provider'
import { Role } from '@/types/enums'
import type { SessionUser } from '@/types/user'

export const metadata: Metadata = {
  title: 'Staff',
  robots: { index: false },
}

// The cn_session cookie is written at login, so it would keep saying "unverified" after an admin
// verifies the account (and keep the old staff type after a change). Layouts cannot write cookies,
// so the fresh values are read from the backend and handed to the UI instead. If the backend cannot
// be reached, the cookie values still work.
async function withFreshStaffDetails(session: SessionUser): Promise<SessionUser> {
  try {
    const staff = await getMyStaffProfile()
    return {
      ...session,
      staffType: staff.staffType,
      verificationStatus: staff.verificationStatus,
    }
  } catch {
    return session
  }
}

// Staff area. Sitter, driver or both: the sidebar follows `staffType`.
export default async function StaffLayout({ children }: { children: ReactNode }) {
  const session = await withFreshStaffDetails(await requireSession(Role.STAFF))
  return (
    <SessionProvider session={session}>
      <DashboardShell>{children}</DashboardShell>
    </SessionProvider>
  )
}
