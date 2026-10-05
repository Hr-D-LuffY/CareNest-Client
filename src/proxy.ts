import { type NextRequest, NextResponse } from 'next/server'
import { decodeJwtPayload, isTokenExpired } from '@/lib/auth/jwt'
import {
  ACCESS_COOKIE,
  GUEST_ONLY_PATHS,
  PAYMENT_PATH_PREFIX,
  REFRESH_COOKIE,
  ROLE_HOME_PATH,
  ROLE_PATH_PREFIX,
} from '@/lib/constants'
import { Role } from '@/types/enums'

// Route guard (Next 16 name for middleware). First of the two places role is enforced; the second
// is the UI (sidebar and buttons from the session). The backend still verifies every API call.
//
//   no session on a protected page   → /login?redirect=<path>
//   wrong role for that area         → that role's own dashboard
//   logged in on /login or /register → their own dashboard
//
// Only decodes the access token's role and expiry. It never trusts it for anything the backend
// would not check again.

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

// The one role allowed under this path, or null for a public page.
function requiredRole(pathname: string): Role | null {
  if (matchesPrefix(pathname, PAYMENT_PATH_PREFIX)) return Role.GUARDIAN
  for (const role of Object.values(Role)) {
    if (matchesPrefix(pathname, ROLE_PATH_PREFIX[role])) return role
  }
  return null
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url))
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value
  const payload = accessToken ? decodeJwtPayload(accessToken) : null
  const session = payload && !isTokenExpired(payload) ? payload : null

  if (GUEST_ONLY_PATHS.includes(pathname)) {
    return session ? redirectTo(request, ROLE_HOME_PATH[session.role]) : NextResponse.next()
  }

  const required = requiredRole(pathname)
  if (!required) return NextResponse.next()

  if (!session) {
    const target = encodeURIComponent(`${pathname}${search}`)
    // The access token is short-lived but the refresh cookie lasts a week. Server Components cannot
    // write cookies, so renew it in a route handler, which then sends the user back here.
    const hasRefreshToken = Boolean(request.cookies.get(REFRESH_COOKIE)?.value)
    return redirectTo(
      request,
      hasRefreshToken ? `/api/auth/refresh?redirect=${target}` : `/login?redirect=${target}`,
    )
  }

  if (session.role !== required) return redirectTo(request, ROLE_HOME_PATH[session.role])
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/staff/:path*',
    '/admin/:path*',
    '/payment/:path*',
    '/login',
    '/register',
  ],
}
