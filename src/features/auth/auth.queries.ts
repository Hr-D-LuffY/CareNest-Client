'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi } from '@/lib/api/client'
import { getErrorMessage } from '@/lib/api/errors'
import { resolvePostLoginPath } from '@/lib/auth/redirect'
import type { SessionUser } from '@/types/user'
import type { LoginInput, RegisterInput } from './auth.schema'
import type { DemoRole } from './demo-roles'

// Login and logout must keep authKeys.session in step so the navbar switches state.
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

// Runs after any successful login: share the user with the navbar, then go to the requested page
// (only if it is theirs to open) or their own dashboard.
function useAfterLogin(redirect: string | null | undefined) {
  const queryClient = useQueryClient()
  const router = useRouter()
  return (session: SessionUser) => {
    queryClient.setQueryData(authKeys.session, session)
    router.replace(resolvePostLoginPath(redirect, session.role))
    router.refresh()
  }
}

// The login mutations handle their own errors (an inline message, a field error, a toast), so the
// global toast is switched off for them. A 401 here is "wrong password", never "session expired".

export function useLoginMutation(redirect: string | null | undefined) {
  const afterLogin = useAfterLogin(redirect)
  return useMutation({
    mutationFn: (values: LoginInput) => authApi.post<SessionUser>('/login', values),
    meta: { skipGlobalError: true },
    onSuccess: afterLogin,
  })
}

// Sign-up logs the new guardian in as well (the BFF route does both), so it ends like a login.
export function useRegisterMutation(redirect: string | null | undefined) {
  const afterLogin = useAfterLogin(redirect)
  return useMutation({
    mutationFn: (values: RegisterInput) => authApi.post<SessionUser>('/register', values),
    meta: { skipGlobalError: true },
    onSuccess: (session) => {
      toast.success('Account created. Welcome to CareNest!')
      afterLogin(session)
    },
  })
}

export function useDemoLoginMutation(redirect: string | null | undefined) {
  const afterLogin = useAfterLogin(redirect)
  return useMutation({
    mutationFn: (role: DemoRole) => authApi.post<SessionUser>('/demo-login', { role }),
    meta: { skipGlobalError: true },
    onSuccess: afterLogin,
    onError: (error) => toast.error(getErrorMessage(error)),
  })
}

// A full page load to /login, not a client-side navigation: it drops the whole TanStack Query cache
// and every bit of React state, so nothing of the last user is left behind for the next one. A
// failure (the network is down) gets the global toast.
export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => authApi.post<null>('/logout'),
    onSuccess: () => window.location.assign('/login'),
  })
}

// After a profile edit: rebuilds the session cookie from the backend, shares the new name and photo
// with the navbar, and refreshes the server layout so the top bar and sidebar show them. A failure
// is not worth a toast: the edit itself was saved, and the old name shows until the next sign-in.
export function useSyncSession() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: () => authApi.post<SessionUser>('/session'),
    meta: { skipGlobalError: true },
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.session, session)
      router.refresh()
    },
  })
}

export function useGoogleLoginMutation(redirect: string | null | undefined) {
  const afterLogin = useAfterLogin(redirect)
  return useMutation({
    mutationFn: (values: { idToken: string; phone?: string }) =>
      authApi.post<SessionUser>('/google', values),
    // The caller decides: a missing phone number opens the extra step, anything else is a toast.
    meta: { skipGlobalError: true },
    onSuccess: afterLogin,
  })
}
