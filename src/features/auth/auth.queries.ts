'use client'

import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api/client'
import type { SessionUser } from '@/types/user'

// Login and logout must invalidate authKeys.session so the navbar switches state.
export const authKeys = {
  session: ['auth', 'session'] as const,
}

// The logged-in user, or null. For public pages, which are static and so cannot read the cookie on
// the server. Dashboards get the session from their layout (SessionProvider) instead.
export function useSessionQuery() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: () => authApi.get<SessionUser | null>('/session'),
    // A failed check just shows the logged-out navbar. No toast for it.
    meta: { skipGlobalError: true },
  })
}
