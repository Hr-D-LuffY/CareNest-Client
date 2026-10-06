import { jsonFailure, jsonFromError, jsonSuccess } from '@/lib/api/respond'
import { getSession, setSessionCookie } from '@/lib/auth/session'
import { buildFreshSession } from '@/lib/auth/sync-session'

// GET /api/auth/session
// Who is logged in, or null. The session cookie is httpOnly, so browser code asks here. Public
// pages stay static and the navbar learns the user after load.
export async function GET() {
  const session = await getSession()
  return jsonSuccess(session ? 'Logged in' : 'Not logged in', session)
}

// POST /api/auth/session
// Rebuilds the session cookie from the backend after the user changed their name, photo or (for
// staff) verification status, and answers with the new session. Takes no body on purpose: the new
// values come from the backend, never from the browser.
export async function POST() {
  const current = await getSession()
  if (!current) return jsonFailure(401, 'You are not signed in.')

  try {
    const fresh = await buildFreshSession(current)
    await setSessionCookie(fresh)
    return jsonSuccess('Session updated', fresh)
  } catch (error) {
    return jsonFromError(error)
  }
}
