import { jsonSuccess } from '@/lib/api/respond'
import { getSession } from '@/lib/auth/session'

// GET /api/auth/session
// Who is logged in, or null. The session cookie is httpOnly, so browser code asks here. Public
// pages stay static and the navbar learns the user after load.
export async function GET() {
  const session = await getSession()
  return jsonSuccess(session ? 'Logged in' : 'Not logged in', session)
}
