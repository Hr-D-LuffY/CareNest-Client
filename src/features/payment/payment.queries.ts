'use client'

import { useMutation } from '@tanstack/react-query'
import type { TopUpPayload } from '@/types'
import { paymentApi } from './payment.api'

// The top-up form shows its own errors (a message under the amount, or above the button), so the
// global toast is switched off. Nothing is invalidated here: the guardian leaves for bKash, and the
// success page refreshes the wallet data when they come back.
export function useTopUp() {
  return useMutation({
    mutationFn: (payload: TopUpPayload) => paymentApi.topUp(payload),
    meta: { skipGlobalError: true },
  })
}
