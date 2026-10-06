import type { PaginationMeta } from './api'

export type Rating = {
  id: string
  bookingId: string
  staffId: string
  score: number
  comment: string | null
  createdAt: string
  guardian: {
    id: string
    user: { name: string }
  }
}

// GET /staff/:id/ratings
export type StaffRatings = {
  average: number
  count: number
  reviews: Rating[]
}

// What the ratings list hands to the UI: the summary and one page of reviews, plus the paging meta
// the backend sends beside them.
export type StaffRatingsPage = StaffRatings & { meta: PaginationMeta }
