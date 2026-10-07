import { z } from 'zod'
import { RATING_COMMENT_MAX_LENGTH, RATING_MAX, RATING_MIN } from '@/lib/constants'
import type { CreateRatingPayload } from '@/types'

// The rating form. Mirrors the backend's createRatingSchema (rating.interface.ts): a whole score
// from 1 to 5 and an optional comment of up to 500 characters. The booking and staff ids come from
// the page, not the form.

export const ratingFormSchema = z.object({
  // 0 means "no star chosen yet".
  score: z
    .number()
    .int('Score must be a whole number')
    .min(RATING_MIN, `Choose a score from ${RATING_MIN} to ${RATING_MAX}`)
    .max(RATING_MAX, `Score must be at most ${RATING_MAX}`),
  // Blank is fine: it is left out of the request (the backend refuses an empty comment).
  comment: z
    .string()
    .trim()
    .max(
      RATING_COMMENT_MAX_LENGTH,
      `Comment must be at most ${RATING_COMMENT_MAX_LENGTH} characters`,
    ),
})

export type RatingFormInput = z.input<typeof ratingFormSchema>

export const EMPTY_RATING_FORM: RatingFormInput = { score: 0, comment: '' }

export function toRatingPayload(
  ids: { bookingId: string; staffId: string },
  value: RatingFormInput,
): CreateRatingPayload {
  const comment = value.comment.trim()
  return { ...ids, score: value.score, ...(comment && { comment }) }
}
