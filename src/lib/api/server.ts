import 'server-only'
import { cookies } from 'next/headers'
import { ACCESS_COOKIE } from '@/lib/constants'
import { env } from '@/lib/env'
import { createApiClient } from './core'

// For Server Components, route handlers and server code. Calls the backend directly and attaches
// the access token from the httpOnly cookie. Browser code uses lib/api/client.ts instead.
export const serverApi = createApiClient({
  baseURL: env.BACKEND_API_URL,
  async getHeaders(): Promise<Record<string, string>> {
    const token = (await cookies()).get(ACCESS_COOKIE)?.value
    return token ? { Authorization: `Bearer ${token}` } : {}
  },
})
