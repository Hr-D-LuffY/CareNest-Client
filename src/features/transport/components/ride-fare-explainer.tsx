import { TRANSPORT_BASE_FARE } from '@/lib/constants'
import { formatBDT } from '@/lib/format'

// How a ride fare is made up, in plain words. The backend works it out when the driver ends the trip;
// this only explains it. Plain markup with no hooks.
export function RideFareExplainer() {
  return (
    <section
      aria-labelledby="ride-fare-heading"
      className="flex w-full flex-col gap-3 rounded-2xl border bg-card p-5 text-left shadow-soft"
    >
      <h2 id="ride-fare-heading" className="font-heading text-lg">
        How a ride is paid for
      </h2>
      <ul className="flex flex-col gap-2 text-sm">
        <li>
          Every ride starts from a flat{' '}
          <span className="font-semibold tabular-nums">{formatBDT(TRANSPORT_BASE_FARE)}</span>, and
          you need at least that much in your wallet to request one.
        </li>
        <li>
          When the driver ends the trip, the fare is the base fare plus the minutes of the trip
          times the driver&apos;s per-minute rate, taken from your wallet.
        </li>
        <li>You can cancel a ride until the driver starts the trip. Nothing is charged for it.</li>
      </ul>
    </section>
  )
}
