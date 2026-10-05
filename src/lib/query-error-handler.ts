import { toast } from 'sonner'
import { getErrorMessage, isApiError } from '@/lib/api/errors'

// Browser-only. The global onError for every query and mutation (wired in QueryProvider): a toast
// with the message from the backend. 429, offline, 409 and the rest all arrive here as ApiError.
export function handleApiError(error: unknown) {
  // A 401 means the session is over. clientApi is already sending the user to /login (lib/api/client.ts),
  // so a toast on top of that would only flash before the page changes.
  if (isApiError(error) && error.isUnauthorized) return

  const message = getErrorMessage(error)
  // The same id means a burst of identical failures (ten queries on a dead connection) shows one toast.
  toast.error(message, { id: message })
}
