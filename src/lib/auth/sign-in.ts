import 'server-only'
import type { LoginPayload, RegisterPayload } from '@/features/auth/auth.schema'
import { ApiError, isApiError } from '@/lib/api/errors'
import { serverApi } from '@/lib/api/server'
import { Role } from '@/types/enums'
import type { StaffProfile } from '@/types/staff'
import type { LoginResult, SessionUser } from '@/types/user'
import { setAuthCookies, setSessionCookie } from './session'

// Shared by every route that starts a session (password login, demo login, Google login):
// backend call → staff details → the three cookies. Returns what the UI keeps in SessionProvider.

// Forward the browser's IP so the backend's per-IP rate limit does not see one shared server.
function forwardedHeaders(clientIp: string | null): Record<string, string> {
  return clientIp ? { 'x-forwarded-for': clientIp } : {}
}

async function startSession(result: LoginResult, forwarded: Record<string, string>) {
  const { accessToken, refreshToken, user } = result

  const session: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePhoto: user.profilePhoto,
  }

  // The login response has no staffType or verificationStatus, but the UI needs both to pick the
  // sidebar and the "pending verification" banner. Fetched before any cookie is written, so a
  // failure here leaves the user signed out instead of half signed in.
  if (user.role === Role.STAFF) {
    const { data: staff } = await serverApi.request<StaffProfile>('/staff/me', {
      headers: { ...forwarded, Authorization: `Bearer ${accessToken}` },
    })
    session.staffType = staff.staffType
    session.verificationStatus = staff.verificationStatus
  }

  await setAuthCookies({ accessToken, refreshToken })
  await setSessionCookie(session)
  return session
}

export async function signIn(
  credentials: LoginPayload,
  clientIp: string | null,
): Promise<SessionUser> {
  const forwarded = forwardedHeaders(clientIp)
  const { data } = await serverApi.request<LoginResult>('/auth/login', {
    method: 'POST',
    body: credentials,
    headers: forwarded,
  })
  return startSession(data, forwarded)
}

// `phone` is only needed the first time an email signs in with Google (the backend creates the
// guardian account then, and a guardian profile requires a phone number).
export async function signInWithGoogle(
  payload: { idToken: string; phone?: string },
  clientIp: string | null,
): Promise<SessionUser> {
  const forwarded = forwardedHeaders(clientIp)
  const { data } = await serverApi.request<LoginResult>('/auth/google', {
    method: 'POST',
    body: payload,
    headers: forwarded,
  })
  return startSession(data, forwarded)
}

// Guardian sign-up: create the account, then log in with the same credentials so the user lands in
// their dashboard without a second form. A failure while registering (duplicate email, bad field)
// passes through unchanged, so the form can show it.
export async function registerAndSignIn(
  payload: RegisterPayload,
  clientIp: string | null,
): Promise<SessionUser> {
  await serverApi.request('/auth/register', {
    method: 'POST',
    body: payload,
    headers: forwardedHeaders(clientIp),
  })

  try {
    return await signIn({ email: payload.email, password: payload.password }, clientIp)
  } catch (error) {
    // The account exists now, so tell the user to log in rather than to register again.
    throw new ApiError({
      status: isApiError(error) && !error.isNetworkError ? error.status : 502,
      message: 'Your account was created, but we could not log you in. Please log in.',
    })
  }
}
