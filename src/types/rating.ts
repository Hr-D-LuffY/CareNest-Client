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
