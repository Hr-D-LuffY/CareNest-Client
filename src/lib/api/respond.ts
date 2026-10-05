import 'server-only'
import type { ZodError } from 'zod'
import type { ApiFailure, ApiSuccess } from '@/types/api'
import { getErrorMessage, isApiError } from './errors'

// Response builders for our own route handlers (src/app/api/auth/*), so they answer in the same
// envelope as the backend and the browser client can parse both the same way.

export function jsonSuccess<T>(message: string, data: T, status = 200) {
  const body: ApiSuccess<T> = { success: true, message, data }
  return Response.json(body, { status })
}

export function jsonFailure(status: number, message: string, errors: ApiFailure['errors'] = []) {
  const body: ApiFailure = { success: false, message, errors }
  return Response.json(body, { status })
}

// A failed backend call keeps its real status (401 bad password, 429, 409...). Anything that is not
// an ApiError is unexpected and becomes a 500, without leaking its text.
export function jsonFromError(error: unknown) {
  if (isApiError(error)) {
    // status 0 = the backend never answered: report it as a bad gateway, like the BFF proxy does.
    return jsonFailure(
      error.isNetworkError ? 502 : error.status,
      getErrorMessage(error),
      error.errors,
    )
  }
  return jsonFailure(500, 'Something went wrong. Please try again.')
}

export function jsonFromZod(error: ZodError) {
  const errors = error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))
  return jsonFailure(400, errors[0]?.message ?? 'Invalid request.', errors)
}

// Reads a JSON body without throwing. A missing or malformed body becomes `{}`, so the Zod schema
// then reports the missing fields instead of the route crashing.
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return {}
  }
}
