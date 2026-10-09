import type { NextRequest } from 'next/server'
import { API_TIMEOUT_MS } from '@/lib/api/core'
import { NETWORK_ERROR_MESSAGE } from '@/lib/api/errors'
import { refreshAccessToken } from '@/lib/auth/refresh'
import { getAccessToken } from '@/lib/auth/session'
import { env } from '@/lib/env'

// The free-tier backend can take about a minute to wake up, so Vercel must not cut this off first.
export const maxDuration = 60

// BFF proxy: the browser calls /api/backend/<path>, this forwards to the backend with the Bearer
// token from the httpOnly cookie. On a 401 it refreshes the session once and retries once.
// This is the only place besides lib/api/* that talks to the backend.

type RouteContext = { params: Promise<{ path: string[] }> }

// Request headers worth forwarding. Cookies and Host are deliberately left out.
const FORWARDED_HEADERS = ['content-type', 'accept', 'accept-language']

function buildTargetUrl(path: string[], search: string) {
  return `${env.BACKEND_API_URL}/${path.map(encodeURIComponent).join('/')}${search}`
}

function buildHeaders(request: NextRequest, accessToken: string | undefined) {
  const headers = new Headers()
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }
  // The browser's real IP, so the backend's per-IP rate limit does not see one shared server.
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) headers.set('x-forwarded-for', forwardedFor)
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`)
  return headers
}

function forward(url: string, request: NextRequest, body: ArrayBuffer | undefined, token?: string) {
  return fetch(url, {
    method: request.method,
    headers: buildHeaders(request, token),
    body,
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
    cache: 'no-store',
  })
}

// Pass the backend's answer through untouched (status, JSON, content type). Its Set-Cookie and
// encoding headers are dropped on purpose.
function passThrough(upstream: Response) {
  const headers = new Headers()
  const contentType = upstream.headers.get('content-type')
  if (contentType) headers.set('content-type', contentType)
  return new Response(upstream.body, { status: upstream.status, headers })
}

function gatewayError() {
  return Response.json(
    { success: false, message: NETWORK_ERROR_MESSAGE, errors: [] },
    { status: 502 },
  )
}

async function handler(request: NextRequest, { params }: RouteContext) {
  const { path } = await params
  const url = buildTargetUrl(path, request.nextUrl.search)

  // Buffered (uploads are capped at 5 MB) so the body can be replayed after a token refresh.
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  const body = hasBody ? await request.arrayBuffer() : undefined

  try {
    const accessToken = (await getAccessToken()) ?? (await refreshAccessToken()) ?? undefined
    const first = await forward(url, request, body, accessToken)
    if (first.status !== 401 || !accessToken) return passThrough(first)

    const freshToken = await refreshAccessToken()
    if (!freshToken) return passThrough(first)

    first.body?.cancel()
    return passThrough(await forward(url, request, body, freshToken))
  } catch {
    return gatewayError()
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE }
