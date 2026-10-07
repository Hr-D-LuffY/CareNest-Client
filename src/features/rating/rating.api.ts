import { staffApi } from '@/features/staff/staff.api'
import { clientApi } from '@/lib/api/client'
import type { CreateRatingPayload, Rating } from '@/types'

// The most reviews one page of the backend's ratings list can hold.
const LOOKUP_PAGE_SIZE = 100

// One function per endpoint, for the browser (through the BFF).
export const ratingApi = {
  // 409 when the staff member was already rated for this booking, or did not complete a session or
  // trip on it.
  create: (payload: CreateRatingPayload) => clientApi.post<Rating>('/rating', payload),

  // The backend has no "my rating for this booking" endpoint. A booking is only ever the
  // guardian's own, and there is one rating per staff member per booking, so the review of that
  // booking in the staff member's latest reviews is theirs. If it is not in the latest page, the
  // backend still refuses a second rating with a 409, and the form says so.
  forBooking: async (staffId: string, bookingId: string, signal?: AbortSignal) => {
    const { reviews } = await staffApi.ratings(
      staffId,
      { page: 1, limit: LOOKUP_PAGE_SIZE },
      signal,
    )
    return reviews.find((review) => review.bookingId === bookingId) ?? null
  },
}
