import { z } from 'zod'

// Mirror the backend's schemas (auth.interface.ts). The route handlers validate with them on the
// server, and the forms pass them to TanStack Form as the validator.

export const loginSchema = z.object({
  email: z.email('A valid email is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.input<typeof loginSchema>
export type LoginPayload = z.output<typeof loginSchema>

const phoneField = z.string().trim().min(1, 'Phone is required')

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
  phone: phoneField.optional(),
})

// The extra step for a first-time Google sign-in: the one field the backend still needs.
export const googlePhoneSchema = z.object({ phone: phoneField })
export type GooglePhoneInput = z.input<typeof googlePhoneSchema>
