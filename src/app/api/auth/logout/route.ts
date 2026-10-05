import { jsonSuccess } from '@/lib/api/respond'
import { serverApi } from '@/lib/api/server'
import { clearAuthCookies, getRefreshToken } from '@/lib/auth/session'

// POST /api/auth/logout
// Revokes the refresh token on the backend, then clears the three session cookies.
export async function POST() {
  const refreshToken = await getRefreshToken()

  if (refreshToken) {
    try {
      await serverApi.post('/auth/logout', { refreshToken })
    } catch {
      // The user asked to leave. If the backend is asleep or already forgot the token, the cookies
      // still go, and the token expires on its own.
    }
  }

  await clearAuthCookies()
  return jsonSuccess('Logged out successfully', null)
}
