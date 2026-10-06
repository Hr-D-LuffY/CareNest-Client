// Card backgrounds for the room page, so the cards that matter most look the part. Both are built
// from theme tokens only, so they follow light and dark mode.

// The strong one, for the cards the guardian acts on or reads first (booking, about the room).
// Text on it must use text-primary-foreground (and /80 for secondary text).
export const BRAND_SURFACE =
  'relative isolate overflow-hidden bg-linear-to-br from-primary to-[color-mix(in_oklch,var(--primary),black_30%)] text-primary-foreground shadow-float'

// The quiet one, for helper cards (the price calculator): a light peach wash that fades into the
// card colour, so it never competes with the strong one.
export const SOFT_SURFACE =
  'relative isolate overflow-hidden border bg-linear-to-br from-secondary via-info-soft to-card text-foreground shadow-soft'

// A second quiet wash, for the "About this room" card: a soft green corner fading into the card
// colour, so it is clearly a different card from the price calculator.
export const FRESH_SURFACE =
  'relative isolate overflow-hidden border bg-linear-to-br from-success-soft via-card to-card text-foreground shadow-soft'
