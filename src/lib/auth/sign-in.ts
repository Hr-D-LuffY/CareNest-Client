import 'server-only'
import type { LoginPayload } from '@/features/auth/auth.schema'
import { serverApi } from '@/lib/api/server'
import { Role } from '@/types/enums'
import type { StaffProfile } from '@/types/staff'
import type { LoginResult, SessionUser } from '@/types/user'
import { setAuthCookies, setSessionCookie } from './session'

// Shared by every route that starts a session (login now, demo login and register later):
// backend login → staff details → the three cookies. Returns what the UI keeps in SessionProvider.
export async function signIn(
  credentials: LoginPayload,
  clientIp: string | null,
): Promise<SessionUser> {
  // Forward the browser's IP so the backend's per-IP rate limit does not see one shared server.
  const forwarded: Record<string, string> = clientIp ? { 'x-forwarded-for': clientIp } : {}

  const { accessToken, refreshToken, user } = (
    await serverApi.request<LoginResult>('/auth/login', {
      method: 'POST',
      body: credentials,
      headers: forwarded,
    })
  ).data

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
