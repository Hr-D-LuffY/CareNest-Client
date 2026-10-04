import type { ApiFieldError } from '@/types/api'

export const NETWORK_ERROR_MESSAGE = "Can't reach the server. Check your connection and try again."
export const RATE_LIMIT_MESSAGE = 'Too many requests, please wait a moment.'

type ApiErrorInit = {
  status: number
  message: string
  errors?: ApiFieldError[]
}

// Every failed backend call becomes one of these, on the server and in the browser.
// status 0 means the request never got an answer (offline, backend asleep, timeout).
export class ApiError extends Error {
  readonly status: number
  readonly errors: ApiFieldError[]

  constructor({ status, message, errors = [] }: ApiErrorInit) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }

  get isNetworkError() {
    return this.status === 0
  }

  get isUnauthorized() {
    return this.status === 401
  }

  get isNotFound() {
    return this.status === 404
  }

  get isRateLimited() {
    return this.status === 429
  }

  // { "email": "Invalid email" }: ready to map onto form fields. First message per path wins.
  get fieldErrors(): Record<string, string> {
    const byPath: Record<string, string> = {}
    for (const { path, message } of this.errors) {
      if (!(path in byPath)) byPath[path] = message
    }
    return byPath
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

// Safe text for a toast, whatever was thrown.
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}
