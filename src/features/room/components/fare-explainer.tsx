import { Calculator } from 'lucide-react'

const PARTS = [
  { sign: null, label: 'Hours', hint: 'Time your child stays' },
  { sign: '×', label: 'Hourly rate', hint: 'Set for each sitter' },
  { sign: '×', label: 'Room multiplier', hint: 'Set for each room' },
] as const

// A side box next to the room list that explains how a care fee is calculated, so the price on
// each card makes sense. Plain markup with no hooks.
export function FareExplainer() {
  return (
    <section
      aria-labelledby="fare-explainer-heading"
      className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-soft sm:p-5"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info"
        >
          <Calculator className="size-5" />
        </span>
        <h2 id="fare-explainer-heading" className="text-lg leading-tight">
          How the care fee is calculated
        </h2>
      </div>

      {/* The sum, drawn as a column of boxes with the signs beside them. Read aloud as one sentence
          instead, because the signs alone would not make sense. */}
      <p className="sr-only">
        The care fee is the hours, times the sitter&apos;s hourly rate, times the room multiplier.
      </p>
      <ol aria-hidden="true" className="flex flex-col gap-2">
        {PARTS.map((part) => (
          <li key={part.label} className="flex items-center gap-3">
            <span className="w-4 text-center font-heading text-lg text-muted-foreground">
              {part.sign}
            </span>
            <div className="flex flex-1 flex-col rounded-xl border bg-background px-3 py-2">
              <span className="text-sm font-semibold">{part.label}</span>
              <span className="text-xs text-muted-foreground">{part.hint}</span>
            </div>
          </li>
        ))}
        <li className="flex items-center gap-3">
          <span className="w-4 text-center font-heading text-lg text-muted-foreground">=</span>
          <div className="flex flex-1 flex-col rounded-xl bg-primary px-3 py-2 text-primary-foreground">
            <span className="text-sm font-semibold">Care fee</span>
            <span className="text-xs opacity-80">Taken from your wallet</span>
          </div>
        </li>
      </ol>

      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        <li>
          The price on each card is for one hour: the sitter&apos;s hourly rate × the room
          multiplier. Open a room to work out the total for the hours you need.
        </li>
        <li>
          You book at an estimate for the whole session. The final fee is charged at check-out, for
          the time your child actually stayed.
        </li>
      </ul>
    </section>
  )
}
