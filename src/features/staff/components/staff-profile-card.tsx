import { CalendarRange } from 'lucide-react'
import { StarRating } from '@/components/shared/star-rating'
import { UserAvatar } from '@/components/shared/user-avatar'
import { DAY_LABEL, STAFF_TYPE_LABEL } from '@/lib/constants'
import { formatTimeRange } from '@/lib/format'
import { type AvailabilitySlot, DAYS_OF_WEEK, type DayOfWeek, type StaffType } from '@/types'

type StaffProfileCardProps = {
  name: string
  staffType: StaffType
  // The day this room runs, so it can be marked in the weekly list.
  roomDay: DayOfWeek
  // The average and count from the ratings, or null when they could not be loaded.
  rating: { average: number; count: number } | null
  // The weekly slots, or null when they could not be loaded.
  availability: readonly AvailabilitySlot[] | null
}

function Availability({
  slots,
  roomDay,
}: {
  slots: readonly AvailabilitySlot[] | null
  roomDay: DayOfWeek
}) {
  if (slots === null) {
    return (
      <p className="text-sm text-muted-foreground">
        The weekly availability could not be loaded. Refresh the page to try again.
      </p>
    )
  }

  const days = DAYS_OF_WEEK.map((day) => ({
    day,
    slots: slots.filter((slot) => slot.dayOfWeek === day),
  })).filter((entry) => entry.slots.length > 0)

  if (days.length === 0) {
    return <p className="text-sm text-muted-foreground">No weekly availability listed yet.</p>
  }

  return (
    <dl className="flex flex-col gap-2 text-sm">
      {days.map(({ day, slots: daySlots }) => (
        <div key={day} className="flex items-baseline justify-between gap-3">
          <dt className="font-medium">
            {DAY_LABEL[day]}
            {day === roomDay && <span className="font-normal text-info"> · this room</span>}
          </dt>
          <dd className="text-right text-muted-foreground tabular-nums">
            {daySlots.map((slot) => formatTimeRange(slot.startTime, slot.endTime)).join(', ')}
          </dd>
        </div>
      ))}
    </dl>
  )
}

// The staff member who runs the room: who they are, how guardians rate them, and the hours they
// are available each week. The room payload carries only the staff name and type, so there is no
// photo or bio to show.
export function StaffProfileCard({
  name,
  staffType,
  roomDay,
  rating,
  availability,
}: StaffProfileCardProps) {
  return (
    <section
      aria-labelledby="staff-heading"
      className="flex flex-col gap-5 rounded-2xl border bg-card p-4 shadow-soft sm:p-5"
    >
      <h2 id="staff-heading" className="text-xl">
        Run by
      </h2>

      <div className="flex items-center gap-4">
        <UserAvatar name={name} photo={null} size={64} />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-heading text-lg leading-tight break-words">{name}</p>
          <p className="text-sm text-muted-foreground">{STAFF_TYPE_LABEL[staffType]}</p>
          {rating && rating.count > 0 ? (
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <StarRating value={rating.average} />
              <span className="font-semibold tabular-nums">{rating.average.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({rating.count} {rating.count === 1 ? 'review' : 'reviews'})
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {rating ? 'No reviews yet' : 'Rating unavailable'}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t pt-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <CalendarRange aria-hidden="true" className="size-4 text-muted-foreground" />
          Weekly availability
        </h3>
        <Availability slots={availability} roomDay={roomDay} />
      </div>
    </section>
  )
}
