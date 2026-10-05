import { jsonFailure, jsonFromError, jsonSuccess } from '@/lib/api/respond'
import { refreshAccessToken } from '@/lib/auth/refresh'

// POST /api/auth/refresh
// Exchanges the refresh cookie for a new token pair and rotates both cookies. Server Components
// cannot write cookies, so this is how the browser renews an expired access token on demand.
// The BFF proxy refreshes by itself on a 401, so most requests never need to call this.
export async function POST() {
  try {
    const accessToken = await refreshAccessToken()
    if (!accessToken) return jsonFailure(401, 'Your session has expired. Please log in again.')
    return jsonSuccess('Session refreshed', null)
  } catch (error) {
    return jsonFromError(error)
  }
}
