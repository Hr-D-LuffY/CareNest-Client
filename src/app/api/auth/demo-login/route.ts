import { z } from 'zod'
import { DEMO_ROLES } from '@/features/auth/demo-roles'
import { jsonFailure, jsonFromError, jsonFromZod, jsonSuccess, readJson } from '@/lib/api/respond'
import { getDemoCredentials } from '@/lib/auth/demo-credentials'
import { signIn } from '@/lib/auth/sign-in'

const demoLoginSchema = z.object({ role: z.enum(DEMO_ROLES) })

// POST /api/auth/demo-login { role: "GUARDIAN" | "SITTER" | "DRIVER" | "ADMIN" }
// The browser only says which role. The credentials are looked up here, on the server.
export async function POST(request: Request) {
  const parsed = demoLoginSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonFromZod(parsed.error)

  const credentials = getDemoCredentials(parsed.data.role)
  if (!credentials) {
    return jsonFailure(503, 'This demo account is not set up yet.')
  }

  try {
    const session = await signIn(credentials, request.headers.get('x-forwarded-for'))
    return jsonSuccess('Logged in successfully', session)
  } catch (error) {
    return jsonFromError(error)
  }
}
