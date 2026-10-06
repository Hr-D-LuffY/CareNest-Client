import 'server-only'
import { isApiError } from '@/lib/api/errors'
import { serverApi } from '@/lib/api/server'
import { Role } from '@/types/enums'
import type { StaffProfile } from '@/types/staff'
import type { GuardianProfile, SessionUser } from '@/types/user'
import { refreshAccessToken } from './refresh'
import { getAccessToken } from './session'

// Reads the signed-in user's own profile from the backend, with the same "refresh once on 401" rule
// as the BFF proxy (the access cookie can outlive the access token inside it).
async function fetchOwnProfile<T>(path: string): Promise<T> {
  const token = (await getAccessToken()) ?? (await refreshAccessToken())
  const withToken = (accessToken: string | null | undefined) => {
    const headers: Record<string, string> = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {}
    return { headers }
  }

  try {
    return (await serverApi.request<T>(path, withToken(token))).data
  } catch (error) {
    if (!isApiError(error) || !error.isUnauthorized) throw error
    const fresh = await refreshAccessToken()
    if (!fresh) throw error
    return (await serverApi.request<T>(path, withToken(fresh))).data
  }
}

// The session the UI keeps (cn_session) is a copy of a few backend fields. After the user edits their
// profile, this rebuilds it from the backend, so the top bar shows the new name and photo. It only
// ever reads from the backend, never from the request, so the browser cannot choose its own role.
export async function buildFreshSession(current: SessionUser): Promise<SessionUser> {
  if (current.role === Role.GUARDIAN) {
    const profile = await fetchOwnProfile<GuardianProfile>('/guardian/me')
    return { ...current, name: profile.name, profilePhoto: profile.profilePhoto }
  }

  if (current.role === Role.STAFF) {
    const staff = await fetchOwnProfile<StaffProfile>('/staff/me')
    return {
      ...current,
      name: staff.user.name,
      profilePhoto: staff.user.profilePhoto,
      staffType: staff.staffType,
      verificationStatus: staff.verificationStatus,
    }
  }

  // The admin account is seeded and has no profile page.
  return current
}
