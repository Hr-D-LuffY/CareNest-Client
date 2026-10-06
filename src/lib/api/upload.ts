import type { ApiFailure, ApiResponse } from '@/types/api'
import { API_TIMEOUT_MS } from './core'
import { ApiError, NETWORK_ERROR_MESSAGE, RATE_LIMIT_MESSAGE } from './errors'

// Browser-only. fetch cannot report upload progress, so file uploads use XMLHttpRequest. They still
// go through our BFF (/api/backend/*), which attaches the token, so the browser never sees it.

export type UploadOptions = {
  // Backend path, e.g. "/child/<id>/photo".
  path: string
  // The multipart field the backend expects ("photo", "document").
  field: string
  file: File
  // 0 to 100, as the browser sends the body to our server.
  onProgress?: (percent: number) => void
}

function parseEnvelope(text: string): ApiResponse<unknown> | null {
  try {
    const payload: unknown = JSON.parse(text)
    if (typeof payload === 'object' && payload !== null && 'success' in payload) {
      return payload as ApiResponse<unknown>
    }
  } catch {
    // Not JSON (a gateway error page): handled as an unexpected response below.
  }
  return null
}

export function uploadFile<T>({ path, field, file, onProgress }: UploadOptions): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `/api/backend${path}`)
    xhr.timeout = API_TIMEOUT_MS
    xhr.responseType = 'text'

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }

    // No answer at all: offline, DNS, timeout or the request was aborted.
    const fail = () => reject(new ApiError({ status: 0, message: NETWORK_ERROR_MESSAGE }))
    xhr.onerror = fail
    xhr.ontimeout = fail
    xhr.onabort = fail

    xhr.onload = () => {
      const payload = parseEnvelope(xhr.responseText)
      if (xhr.status >= 200 && xhr.status < 300 && payload?.success) {
        onProgress?.(100)
        resolve(payload.data as T)
        return
      }
      const failure: Partial<ApiFailure> = payload && !payload.success ? payload : {}
      reject(
        new ApiError({
          status: xhr.status,
          message:
            xhr.status === 429
              ? RATE_LIMIT_MESSAGE
              : failure.message || 'The upload failed. Please try again.',
          errors: failure.errors ?? [],
        }),
      )
    }

    const body = new FormData()
    body.append(field, file)
    xhr.send(body)
  })
}
