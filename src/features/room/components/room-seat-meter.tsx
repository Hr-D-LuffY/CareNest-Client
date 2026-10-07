import { Hourglass, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RoomWithSeats } from '@/types'

// The bar turns amber when a quarter of the seats or fewer are left, and red when the room is full.
const LOW_SEATS_SHARE = 0.25

function getSeatTone(room: RoomWithSeats) {
  if (room.seatsLeft === 0) return 'bg-destructive'
  return room.seatsLeft <= room.capacity * LOW_SEATS_SHARE ? 'bg-warning' : 'bg-success'
}

// Seats left for one session as words and a bar, and the waitlist notice when the room is full.
// `onBrand` is for the strong brand card: light track, light bar and a light waitlist notice, since
// the status colours do not show up on brown. The words carry the meaning either way.
export function SeatMeter({
  room,
  onBrand = false,
  showWaitlistNote = true,
}: {
  room: RoomWithSeats
  onBrand?: boolean
  // The "booking this session puts your child on the waitlist" line is for guardians, so staff
  // pages leave it out.
  showWaitlistNote?: boolean
}) {
  const full = room.seatsLeft === 0
  const share = room.capacity > 0 ? Math.min(100, (room.bookedSeats / room.capacity) * 100) : 100

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          <Users aria-hidden="true" className={cn('size-4', !onBrand && 'text-muted-foreground')} />
          {full ? 'No seats left' : `${room.seatsLeft} of ${room.capacity} seats left`}
        </span>
        <span
          className={cn(
            'text-xs tabular-nums',
            onBrand ? 'text-primary-foreground/80' : 'text-muted-foreground',
          )}
        >
          {room.bookedSeats}/{room.capacity} booked
        </span>
      </div>
      {/* Decorative: the seats left are already stated in words above. */}
      <div
        aria-hidden="true"
        className={cn(
          'h-2 overflow-hidden rounded-full',
          onBrand ? 'bg-primary-foreground/25' : 'bg-muted',
        )}
      >
        <div
          className={cn(
            'h-full rounded-full',
            onBrand ? 'bg-primary-foreground' : getSeatTone(room),
          )}
          style={{ width: `${share}%` }}
        />
      </div>
      {full && showWaitlistNote && (
        <p
          className={cn(
            'flex items-start gap-1.5 text-sm',
            onBrand ? 'rounded-lg bg-background px-3 py-2 text-warning' : 'text-warning',
          )}
        >
          <Hourglass aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Booking this session puts your child on the waitlist.
        </p>
      )}
    </div>
  )
}
