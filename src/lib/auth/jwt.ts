import { z } from 'zod'
import { Role } from '@/types/enums'
import type { AccessTokenPayload } from '@/types/user'

// Reads the payload of the backend's access token. It does NOT verify the signature: proxy.ts only
// needs the role and expiry to route the user, and the backend verifies every real request.
// No Node-only APIs here, because proxy.ts imports it.

const payloadSchema = z.object({
  userId: z.string(),
  email: z.string(),
  role: z.enum(Role),
  iat: z.number(),
  exp: z.number(),
})

// JWT segments are base64url (no padding, "-" and "_"), and may hold UTF-8 (a name with accents).
function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

// Returns null for anything that is not a well-formed CareNest access token.
export function decodeJwtPayload(token: string): AccessTokenPayload | null {
  const segment = token.split('.')[1]
  if (!segment) return null
  try {
    const parsed = payloadSchema.safeParse(JSON.parse(decodeBase64Url(segment)))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

// Treat a token as expired a few seconds early so it cannot lapse between the proxy and the backend.
const EXPIRY_SKEW_SECONDS = 10

export function isTokenExpired(payload: AccessTokenPayload, nowMs = Date.now()): boolean {
  return payload.exp - EXPIRY_SKEW_SECONDS <= nowMs / 1000
}
