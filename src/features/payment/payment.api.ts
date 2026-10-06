import { clientApi } from '@/lib/api/client'
import type { TopUpPayload, TopUpResult } from '@/types'

// One function per endpoint, for the browser (through the BFF). The callback and result pages run on
// the server and use payment.server.ts instead.
export const paymentApi = {
  topUp: (payload: TopUpPayload) => clientApi.post<TopUpResult>('/payment/top-up', payload),
}
