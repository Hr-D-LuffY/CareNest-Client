'use client'

import { createContext, type ReactNode } from 'react'
import type { SessionUser } from '@/types/user'

// Who is logged in, for client components. Each area layout (dashboard, staff, admin) reads the
// cn_session cookie on the server and passes it in. After a profile update, `router.refresh()`
// re-renders the layout with the new value, so there is no client copy to keep in sync.
export const SessionContext = createContext<SessionUser | null>(null)

export function SessionProvider({
  session,
  children,
}: {
  session: SessionUser
  children: ReactNode
}) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
