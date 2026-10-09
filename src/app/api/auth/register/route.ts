import { registerSchema } from '@/features/auth/auth.schema'
import { jsonFromError, jsonFromZod, jsonSuccess, readJson } from '@/lib/api/respond'
import { registerAndSignIn } from '@/lib/auth/sign-in'

// The free-tier backend can take about a minute to wake up, so Vercel must not cut this off first.
export const maxDuration = 60

// POST /api/auth/register { name, email, password, phone, address? }
// Creates a guardian account on the backend, then logs it in and stores the session cookies.
export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonFromZod(parsed.error)

  try {
    const session = await registerAndSignIn(parsed.data, request.headers.get('x-forwarded-for'))
    return jsonSuccess('Account created successfully', session, 201)
  } catch (error) {
    return jsonFromError(error)
  }
}
