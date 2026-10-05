import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { jsonFailure, jsonFromError, jsonSuccess } from '@/lib/api/respond'
import { decodeJwtPayload, isTokenExpired } from '@/lib/auth/jwt'
import { safeRedirectPath } from '@/lib/auth/redirect'
import { refreshAccessToken } from '@/lib/auth/refresh'
import { clearAuthCookies } from '@/lib/auth/session'

// Exchanges the refresh cookie for a new token pair and rotates both cookies. Server Components
// cannot write cookies, so renewing an expired access token has to happen in a route handler.
// The BFF proxy refreshes by itself on a 401, so API calls never need this.

// POST /api/auth/refresh: for browser code. JSON answer.
export async function POST() {
  try {
    const accessToken = await refreshAccessToken()
    if (!accessToken) return jsonFailure(401, 'Your session has expired. Please log in again.')
    return jsonSuccess('Session refreshed', null)
  } catch (error) {
    return jsonFromError(error)
  }
}

// GET /api/auth/refresh?redirect=<path>: for page navigations. proxy.ts sends a user here when
// the access token has expired. Refresh, then go back to the page they asked for, or to /login.
export async function GET(request: NextRequest) {
  const target = safeRedirectPath(request.nextUrl.searchParams.get('redirect'), '/')
  const toLogin = () =>
    NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(target)}`, request.url))

  try {
    const accessToken = await refreshAccessToken()
    const payload = accessToken ? decodeJwtPayload(accessToken) : null
    // A new token that is already expired (a badly skewed clock) would bounce between here and the
    // proxy forever, so end the session instead.
    if (payload && !isTokenExpired(payload)) {
      return NextResponse.redirect(new URL(target, request.url))
    }
    await clearAuthCookies()
    return toLogin()
  } catch {
    // Backend unreachable: keep the cookies, so the session survives once it is back.
    return toLogin()
  }
}
