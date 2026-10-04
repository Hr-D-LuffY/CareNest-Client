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
