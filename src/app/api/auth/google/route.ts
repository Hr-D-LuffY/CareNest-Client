import { googleLoginSchema } from '@/features/auth/auth.schema'
import { jsonFromError, jsonFromZod, jsonSuccess, readJson } from '@/lib/api/respond'
import { signInWithGoogle } from '@/lib/auth/sign-in'

// The free-tier backend can take about a minute to wake up, so Vercel must not cut this off first.
export const maxDuration = 60

// POST /api/auth/google { idToken, phone? }
// idToken is the credential Google's sign-in button hands the browser. The backend verifies it with
// Google. A first-time email also needs `phone`: without it the backend answers 400 with a `phone`
// field error, and the login page then asks for the number and sends this again.
export async function POST(request: Request) {
  const parsed = googleLoginSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonFromZod(parsed.error)

  try {
    const session = await signInWithGoogle(parsed.data, request.headers.get('x-forwarded-for'))
    return jsonSuccess('Logged in successfully', session)
  } catch (error) {
    return jsonFromError(error)
  }
}
