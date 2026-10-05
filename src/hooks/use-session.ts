'use client'

import { useContext } from 'react'
import { SessionContext } from '@/providers/session-provider'
import type { SessionUser } from '@/types/user'

// The logged-in user. Only valid below an area layout's SessionProvider; public pages have no session.
export function useSession(): SessionUser {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession must be used inside a <SessionProvider>.')
  return session
}
