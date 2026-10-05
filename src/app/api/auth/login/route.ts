import { loginSchema } from '@/features/auth/auth.schema'
import { jsonFromError, jsonFromZod, jsonSuccess, readJson } from '@/lib/api/respond'
import { signIn } from '@/lib/auth/sign-in'

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
