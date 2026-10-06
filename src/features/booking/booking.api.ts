import { clientApi } from '@/lib/api/client'
import type { Booking, CreateBookingPayload, CreateBookingResult, WaitlistEntry } from '@/types'

// One function per endpoint, for the browser (through the BFF).
export const bookingApi = {
  // 201 answers with the confirmed Booking, 202 (a full room) with a WaitlistEntry. Only a
  // WaitlistEntry has a priorityScore, so that tells the two apart.
  create: async (payload: CreateBookingPayload): Promise<CreateBookingResult> => {
    const { data } = await clientApi.request<Booking | WaitlistEntry>('/booking', {
      method: 'POST',
      body: payload,
    })
    return 'priorityScore' in data
      ? { outcome: 'waitlisted', entry: data }
      : { outcome: 'confirmed', booking: data }
  },
}
