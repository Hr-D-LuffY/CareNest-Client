import { z } from 'zod'

// Mirrors the backend's loginSchema (auth.interface.ts). The login route validates with it on the
// server, and the login form (commit #11) passes it to TanStack Form as the validator.
export const loginSchema = z.object({
  email: z.email('A valid email is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.input<typeof loginSchema>
export type LoginPayload = z.output<typeof loginSchema>
