import { createApiClient } from './core'
import { ApiError } from './errors'

// For Client Components. Calls our own BFF (/api/backend/*), which attaches the token, so no
// token ever reaches the browser. Server code uses lib/api/server.ts instead.
const api = createApiClient({ baseURL: '/api/backend' })

// Our own auth route handlers (/api/auth/*: login, logout, session). Same envelope and ApiError as
// the backend, but no 401 redirect: a wrong password is a 401 the form has to show itself.
export const authApi = createApiClient({ baseURL: '/api/auth' })

const AUTH_PAGES = ['/login', '/register', '/forgot-password']

// The BFF already tried to refresh the session once. A 401 here means the user is signed out.
function redirectToLogin() {
  if (typeof window === 'undefined') return
  const { pathname, search } = window.location
  if (AUTH_PAGES.some((page) => pathname.startsWith(page))) return
  window.location.assign(`/login?redirect=${encodeURIComponent(pathname + search)}`)
}

async function guard<T>(call: Promise<T>): Promise<T> {
  try {
    return await call
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) redirectToLogin()
    throw error
  }
}

export const clientApi = {
  request: <T>(...args: Parameters<typeof api.request<T>>) => guard(api.request<T>(...args)),
  get: <T>(...args: Parameters<typeof api.get<T>>) => guard(api.get<T>(...args)),
  getList: <T>(...args: Parameters<typeof api.getList<T>>) => guard(api.getList<T>(...args)),
  post: <T>(...args: Parameters<typeof api.post<T>>) => guard(api.post<T>(...args)),
  patch: <T>(...args: Parameters<typeof api.patch<T>>) => guard(api.patch<T>(...args)),
  put: <T>(...args: Parameters<typeof api.put<T>>) => guard(api.put<T>(...args)),
  delete: <T = null>(...args: Parameters<typeof api.delete<T>>) => guard(api.delete<T>(...args)),
}
