import { z } from 'zod'
import { TOP_UP_MAX_AMOUNT, TOP_UP_MIN_AMOUNT } from '@/lib/constants'
import type { TopUpPayload } from '@/types'

// Mirrors the backend's topUpSchema (payment.interface.ts): 10 to 25,000 BDT, at most 2 decimal
// places. The form keeps the amount as the text the guardian typed; it becomes a number only in
// toTopUpPayload, because that is what the backend expects.

const MAX_DECIMAL_PLACES = 2

export const topUpFormSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d+)?$/, 'Amount must be a number')
    .refine(
      (value) => (value.split('.')[1]?.length ?? 0) <= MAX_DECIMAL_PLACES,
      `Amount can have at most ${MAX_DECIMAL_PLACES} decimal places`,
    )
    .refine(
      (value) => Number(value) >= TOP_UP_MIN_AMOUNT,
      `Minimum top-up is ${TOP_UP_MIN_AMOUNT} BDT`,
    )
    .refine(
      (value) => Number(value) <= TOP_UP_MAX_AMOUNT,
      `Maximum top-up is ${TOP_UP_MAX_AMOUNT} BDT`,
    ),
})

export type TopUpFormInput = z.infer<typeof topUpFormSchema>

export const EMPTY_TOP_UP_FORM: TopUpFormInput = { amount: '' }

export function toTopUpPayload(value: TopUpFormInput): TopUpPayload {
  return { amount: Number(value.amount) }
}
