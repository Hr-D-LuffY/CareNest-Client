import { FetchError, ofetch } from 'ofetch'
import type { ApiFailure, ApiResponse, Paginated, PaginationMeta } from '@/types/api'
import { ApiError, NETWORK_ERROR_MESSAGE, RATE_LIMIT_MESSAGE } from './errors'

// Shared by lib/api/server.ts and lib/api/client.ts so both sides unwrap the envelope and
// throw ApiError the same way. Nothing else in the app may call the backend with raw fetch.

// Render's free tier can take 30 to 60 seconds to wake up.
export const API_TIMEOUT_MS = 60_000

type QueryValue = string | number | boolean | null | undefined
export type ApiQuery = Record<string, QueryValue>

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: ApiQuery
  // A plain object is sent as JSON, FormData as multipart.
  body?: Record<string, unknown> | unknown[] | FormData
  headers?: Record<string, string>
  signal?: AbortSignal
}

// Full result, for callers that need the HTTP status (POST /booking answers 201 or 202).
export type ApiResult<T> = {
  data: T
  message: string
  meta?: PaginationMeta
  status: number
}

type ClientConfig = {
  baseURL: string
  // Extra headers per request, e.g. the Bearer token on the server.
  getHeaders?: () => Promise<Record<string, string>>
}

function cleanQuery(query: ApiQuery | undefined) {
  if (!query) return undefined
  const cleaned: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') cleaned[key] = value
  }
  return cleaned
}

function isEnvelope(payload: unknown): payload is ApiResponse<unknown> {
  return typeof payload === 'object' && payload !== null && 'success' in payload
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (error instanceof FetchError && error.response) {
    const status = error.response.status
    const payload: unknown = error.data
    const failure: Partial<ApiFailure> = isEnvelope(payload) && !payload.success ? payload : {}
    const message =
      status === 429
        ? RATE_LIMIT_MESSAGE
        : failure.message || error.response.statusText || 'Request failed.'
    return new ApiError({ status, message, errors: failure.errors ?? [] })
  }

  // No response at all: offline, DNS, backend asleep, timeout.
  return new ApiError({ status: 0, message: NETWORK_ERROR_MESSAGE })
}

export function createApiClient({ baseURL, getHeaders }: ClientConfig) {
  const http = ofetch.create({ baseURL, timeout: API_TIMEOUT_MS })

  async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
    const method = options.method ?? 'GET'
    try {
      const authHeaders = getHeaders ? await getHeaders() : {}
      const response = await http.raw<ApiResponse<T>>(path, {
        method,
        query: cleanQuery(options.query),
        body: options.body,
        headers: { ...authHeaders, ...options.headers },
        signal: options.signal,
        // Only reads are retried (cold-start gateway errors). Writes must never run twice.
        retry: method === 'GET' ? 1 : 0,
        retryDelay: 1000,
        retryStatusCodes: [502, 503, 504],
      })

      const payload = response._data
      if (!isEnvelope(payload) || !payload.success) {
        throw new ApiError({
          status: response.status,
          message: 'Unexpected response from the server.',
        })
      }
      return {
        data: payload.data,
        message: payload.message,
        meta: payload.meta,
        status: response.status,
      }
    } catch (error) {
      throw toApiError(error)
    }
  }

  async function data<T>(path: string, options?: RequestOptions): Promise<T> {
    return (await request<T>(path, options)).data
  }

  // List endpoints: { items, meta } instead of a bare array.
  async function list<T>(path: string, options?: RequestOptions): Promise<Paginated<T>> {
    const result = await request<T[]>(path, options)
    return {
      items: result.data,
      meta: result.meta ?? { page: 1, limit: result.data.length, total: result.data.length },
    }
  }

  return {
    request,
    get: <T>(path: string, query?: ApiQuery, signal?: AbortSignal) =>
      data<T>(path, { query, signal }),
    getList: <T>(path: string, query?: ApiQuery, signal?: AbortSignal) =>
      list<T>(path, { query, signal }),
    post: <T>(path: string, body?: RequestOptions['body']) =>
      data<T>(path, { method: 'POST', body }),
    patch: <T>(path: string, body?: RequestOptions['body']) =>
      data<T>(path, { method: 'PATCH', body }),
    put: <T>(path: string, body?: RequestOptions['body']) => data<T>(path, { method: 'PUT', body }),
    delete: <T = null>(path: string) => data<T>(path, { method: 'DELETE' }),
  }
}
