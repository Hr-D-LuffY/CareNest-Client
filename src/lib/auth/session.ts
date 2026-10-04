import 'server-only'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { ACCESS_COOKIE, REFRESH_COOKIE, SESSION_COOKIE } from '@/lib/constants'
import { Role, StaffType, VerificationStatus } from '@/types/enums'
import type { SessionUser } from '@/types/user'

// Cookie helpers for the BFF session. All three cookies are httpOnly on the frontend domain.

// Matches the backend's refresh token lifetime (about 7 days). The access cookie lives as long as
// the refresh cookie on purpose: the access JWT expires on its own (about 1 day) and the BFF then
// refreshes it, instead of the cookie vanishing and signing the user out while a refresh is valid.
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
} as const

const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(Role),
  profilePhoto: z.string().nullable(),
  staffType: z.enum(StaffType).optional(),
  verificationStatus: z.enum(VerificationStatus).optional(),
})

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export async function setAuthCookies({ accessToken, refreshToken }: AuthTokens) {
  const store = await cookies()
  store.set(ACCESS_COOKIE, accessToken, baseCookieOptions)
  store.set(REFRESH_COOKIE, refreshToken, baseCookieOptions)
}

export async function setSessionCookie(user: SessionUser) {
  const store = await cookies()
  store.set(SESSION_COOKIE, JSON.stringify(user), baseCookieOptions)
}

export async function clearAuthCookies() {
  const store = await cookies()
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, SESSION_COOKIE]) {
    store.set(name, '', { ...baseCookieOptions, maxAge: 0 })
  }
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value
}

// The signed-in user for Server Components and layouts, or null (also for a corrupt cookie).
export async function getSession(): Promise<SessionUser | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    const parsed = sessionUserSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
