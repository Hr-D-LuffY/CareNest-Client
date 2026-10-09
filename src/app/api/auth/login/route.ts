import { loginSchema } from '@/features/auth/auth.schema'
import { jsonFromError, jsonFromZod, jsonSuccess, readJson } from '@/lib/api/respond'
import { signIn } from '@/lib/auth/sign-in'

// The free-tier backend can take about a minute to wake up, so Vercel must not cut this off first.
export const maxDuration = 60

// POST /api/auth/login { email, password }
// Logs in against the backend and stores the session in httpOnly cookies on this domain.
export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonFromZod(parsed.error)

  try {
    const session = await signIn(parsed.data, request.headers.get('x-forwarded-for'))
    return jsonSuccess('Logged in successfully', session)
  } catch (error) {
    return jsonFromError(error)
  }
}
