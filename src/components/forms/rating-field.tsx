'use client'

import { Star } from 'lucide-react'
import { useId } from 'react'
import { RATING_MAX } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useFieldContext } from './form-context'
import { getFieldError } from './use-field-error'

const STARS = Array.from({ length: RATING_MAX }, (_, index) => index + 1)

// What each score means, spoken and shown beside the stars so the number is never the only cue.
const SCORE_LABEL: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
}

type RatingFieldProps = {
  label: string
}

// A score from 1 to 5, picked with stars. Radio buttons underneath, so arrow keys and screen
// readers work as they should; each star is a 44 px target. The chosen score is also written out
// ("4 of 5, Very good"), so it does not depend on the colour of the stars.
export function RatingField({ label }: RatingFieldProps) {
  const field = useFieldContext<number>()
  const id = useId()
  const error = getFieldError(field)
  const score = field.state.value

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="mb-1 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="flex items-center">
          {STARS.map((value) => (
            <label
              key={value}
              className="flex size-11 cursor-pointer items-center justify-center rounded-lg has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
            >
              <input
                type="radio"
                name={field.name}
                value={value}
                checked={score === value}
                onChange={() => field.handleChange(value)}
                onBlur={field.handleBlur}
                className="sr-only"
              />
              <Star
                aria-hidden="true"
                className={cn(
                  'size-7 transition-colors',
                  value <= score
                    ? 'fill-warning text-warning'
                    : 'text-muted-foreground/50 hover:text-warning',
                )}
              />
              <span className="sr-only">
                {value} {value === 1 ? 'star' : 'stars'}, {SCORE_LABEL[value]}
              </span>
            </label>
          ))}
        </div>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {score > 0 ? (
            <>
              <span className="font-semibold text-foreground tabular-nums">{score}</span> of{' '}
              {RATING_MAX}, {SCORE_LABEL[score]}
            </>
          ) : (
            'Choose a star'
          )}
        </p>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  )
}
