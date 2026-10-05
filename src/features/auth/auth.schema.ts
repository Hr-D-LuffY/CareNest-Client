import { z } from 'zod'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/lib/constants'

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

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)

// What POST /auth/register accepts. Public sign-up is guardian-only, so there is no role field.
export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('A valid email is required').toLowerCase(),
  password: passwordSchema,
  phone: phoneField,
  // Optional: leave it out entirely when blank. The backend rejects an empty string.
  address: z.string().trim().min(1).optional(),
})

export type RegisterInput = z.input<typeof registerSchema>
export type RegisterPayload = z.output<typeof registerSchema>

// The form adds a confirmation field the backend never sees, and keeps address as plain text.
export const registerFormSchema = registerSchema
  .extend({
    address: z.string().trim(),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterFormInput = z.input<typeof registerFormSchema>

// Form values → request body: drop the confirmation and omit a blank address.
export function toRegisterInput(values: RegisterFormInput): RegisterInput {
  const { name, email, password, phone } = values
  const address = values.address.trim()
  return address ? { name, email, password, phone, address } : { name, email, password, phone }
}

// Step one of a password reset: which account to send the link to.
export const forgotPasswordSchema = z.object({
  email: z.email('A valid email is required').toLowerCase(),
})
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>
