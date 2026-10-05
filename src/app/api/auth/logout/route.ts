import { NextResponse } from 'next/server'
import { jsonSuccess } from '@/lib/api/respond'
import { serverApi } from '@/lib/api/server'
import { clearAuthCookies, getRefreshToken } from '@/lib/auth/session'

async function endSession() {
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
}

// POST /api/auth/logout
// Revokes the refresh token on the backend, then clears the three session cookies.
export async function POST() {
  await endSession()
  return jsonSuccess('Logged out successfully', null)
}

// GET /api/auth/logout
// Only for the dashboard layouts (requireSession): a signed-in user whose session cookie is gone or
// unreadable is signed out cleanly and sent to /login, instead of looping between the two.
export async function GET(request: Request) {
  await endSession()
  return NextResponse.redirect(new URL('/login', request.url))
}
