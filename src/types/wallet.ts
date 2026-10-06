import type { WalletTransactionType } from './enums'

export type WalletTransaction = {
  id: string
  type: WalletTransactionType
  amount: string
  balanceAfter: string
  description: string
  bookingId: string | null
  transportBookingId: string | null
  paymentId: string | null
  createdAt: string
}

// GET /wallet/transactions?page=&limit=&type=
export type WalletListParams = {
  page: number
  limit: number
  type?: WalletTransactionType
}
