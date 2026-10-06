import type { PaymentStatus } from './enums'

// POST /payment/top-up
export type TopUpResult = {
  paymentId: string
  amount: string
  checkoutUrl: string
}

// POST /payment/top-up body. The backend wants a number here, not a string.
export type TopUpPayload = {
  amount: number
}

// GET /payment/bkash/callback
export type PaymentResult = {
  id: string
  status: PaymentStatus
  amount: string
  gatewayTrxId: string | null
}

// GET /payment/:id
export type Payment = PaymentResult & {
  currency: string
  createdAt: string
  updatedAt: string
}

// What bKash appends to our callback URL.
export type BkashCallbackStatus = 'success' | 'failure' | 'cancel'
