import 'server-only'
import { isApiError } from '@/lib/api/errors'
import { serverApi } from '@/lib/api/server'
import type { RefreshResult } from '@/types/user'
import { clearAuthCookies, getRefreshToken, setAuthCookies } from './session'

// Refresh tokens rotate, so two parallel requests that both got a 401 must share one refresh call.
// The second call would otherwise present an already-used token and sign the user out.
const inFlight = new Map<string, Promise<string | null>>()

async function runRefresh(refreshToken: string): Promise<string | null> {
  try {
    const tokens = await serverApi.post<RefreshResult>('/auth/refresh-token', { refreshToken })
    await setAuthCookies(tokens)
    return tokens.accessToken
  } catch (error) {
    // No answer from the backend: keep the session and let the caller report the outage.
    if (isApiError(error) && error.isNetworkError) throw error
    await clearAuthCookies()
    return null
  }
}

// Returns the new access token, or null when the session is over (cookies are cleared then).
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) return null

  const existing = inFlight.get(refreshToken)
  if (existing) return existing

  const attempt = runRefresh(refreshToken).finally(() => inFlight.delete(refreshToken))
  inFlight.set(refreshToken, attempt)
  return attempt
}
