import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { BkashCallbackStatus, Payment, PaymentResult } from '@/types'

// GET /payment/bkash/callback is public: the backend re-checks the payment with bKash itself, so the
// `status` in the URL is only a hint. Repeating the call is safe (it never credits twice).
export const confirmBkashCallback = (paymentID: string, status: BkashCallbackStatus) =>
  serverApi.get<PaymentResult>('/payment/bkash/callback', { paymentID, status })

// The guardian's own payment, as the backend recorded it.
export const getPayment = (id: string) => serverApi.get<Payment>(`/payment/${id}`)
