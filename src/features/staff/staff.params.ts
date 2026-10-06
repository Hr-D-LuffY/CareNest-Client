import type { ApiResult } from '@/lib/api/core'
import type { StaffRatings, StaffRatingsPage } from '@/types'

// Reviews shown per page on a room's detail page.
export const REVIEWS_PAGE_SIZE = 5

// Query params of GET /staff/:id/ratings.
export type StaffRatingsParams = { page: number; limit: number }

// The ratings endpoint answers { average, count, reviews } with the paging meta beside it. This
// folds the two together, with a one-page fallback if the backend ever leaves the meta out.
export function toStaffRatingsPage({ data, meta }: ApiResult<StaffRatings>): StaffRatingsPage {
  return {
    ...data,
    meta: meta ?? { page: 1, limit: data.reviews.length, total: data.reviews.length },
  }
}
