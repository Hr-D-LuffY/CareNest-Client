import { clientApi } from '@/lib/api/client'
import type {
  Booking,
  BookingListParams,
  CreateBookingPayload,
  CreateBookingResult,
  WaitlistEntry,
  WaitlistListParams,
} from '@/types'

// One function per endpoint, for the browser (through the BFF). The server page uses
// booking.server.ts instead.
export const bookingApi = {
  list: (params: BookingListParams, signal?: AbortSignal) =>
    clientApi.getList<Booking>('/booking', params, signal),
  // The guardian's own waitlist entries (a full room answers a booking with a waitlist spot).
  waitlist: (params: WaitlistListParams, signal?: AbortSignal) =>
    clientApi.getList<WaitlistEntry>('/booking/waitlist', params, signal),
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
  // Frees the seat. The backend then promotes the top waitlist entry for that session.
  cancel: (id: string) => clientApi.delete<Booking>(`/booking/${id}`),
}
