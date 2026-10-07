import type { TopRatedStaff } from '@/types'

// The backend sends the two rates as fractions between 0 and 1. A chart and a label want a whole
// percent, kept inside 0–100 so a gauge can never overflow.
export function toPercent(rate: number): number {
  return Math.min(100, Math.max(0, Math.round(rate * 100)))
}

const STAFF_NAME_FALLBACK = 'Unknown staff'

export type StaffScore = {
  staffId: string
  name: string
  // 0–5, one decimal. Display only.
  score: number
  ratingCount: number
}

export function toStaffScores(staff: TopRatedStaff[]): StaffScore[] {
  return staff.map((member) => ({
    staffId: member.staffId,
    name: member.name?.trim() || STAFF_NAME_FALLBACK,
    score: Math.round(member.averageScore * 10) / 10,
    ratingCount: member.ratingCount,
  }))
}

export function isStaffScore(value: unknown): value is StaffScore {
  return (
    typeof value === 'object' &&
    value !== null &&
    'staffId' in value &&
    'name' in value &&
    'score' in value &&
    'ratingCount' in value
  )
}

export const ratingCountText = (count: number) => `${count} ${count === 1 ? 'rating' : 'ratings'}`
