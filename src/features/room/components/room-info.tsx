import { CalendarClock, Layers, type LucideIcon, Users, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { TierBadge } from '@/components/shared/tier-badge'
import { DAY_LABEL } from '@/lib/constants'
import { formatBDT, formatMultiplier, formatTimeRange } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { RoomWithSeats } from '@/types'
import { getHourlyPrice } from '../room-price'

function InfoRow({
  icon: Icon,
  label,
  compact,
  children,
}: {
  icon: LucideIcon
  label: string
  compact: boolean
  children: ReactNode
}) {
  return (
    <li className={cn('flex items-start', compact ? 'gap-2.5' : 'gap-3')}>
      <span
        aria-hidden="true"
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg bg-background/70 text-info ring-1 ring-border',
          compact ? 'size-8' : 'size-9',
        )}
      >
        <Icon className={compact ? 'size-4' : 'size-[18px]'} />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <div className="text-sm">{children}</div>
      </div>
    </li>
  )
}

// The room's price per hour, and how it is made up.
function RoomPrice({ room }: { room: RoomWithSeats }) {
  const hourly = getHourlyPrice(room)
  const { hourlyRate } = room.staff

  if (hourly && hourlyRate) {
    return (
      <>
        <span>
          <span className="font-semibold tabular-nums">{formatBDT(hourly)}</span> per hour
        </span>
        <span className="block text-muted-foreground">
          {formatBDT(hourlyRate)} hourly rate × {formatMultiplier(room.priceMultiplier)} room
          multiplier
        </span>
      </>
    )
  }
  return (
    <span className="text-muted-foreground">
      Not set yet. Booking opens once the sitter&apos;s hourly rate is set.
    </span>
  )
}

type RoomInfoProps = {
  room: RoomWithSeats
  // The card's background (a class string from lib/surfaces.ts).
  surface: string
  // Tighter padding and spacing, for when the card sits in a narrow side column.
  compact?: boolean
}

// What the room is: care tier, weekly schedule, size and price.
export function RoomInfo({ room, surface, compact = false }: RoomInfoProps) {
  return (
    <section
      aria-labelledby="room-info-heading"
      className={cn(
        surface,
        'flex flex-col rounded-2xl',
        compact ? 'gap-3 p-4' : 'gap-4 p-4 sm:p-5',
      )}
    >
      <h2 id="room-info-heading" className={compact ? 'text-lg' : 'text-xl'}>
        About this room
      </h2>
      <ul className={cn('flex flex-col', compact ? 'gap-3' : 'gap-4')}>
        <InfoRow icon={Layers} label="Care tier" compact={compact}>
          <TierBadge tier={room.tier} />
        </InfoRow>
        <InfoRow icon={CalendarClock} label="Schedule" compact={compact}>
          Every {DAY_LABEL[room.dayOfWeek]}, {formatTimeRange(room.startTime, room.endTime)}
        </InfoRow>
        <InfoRow icon={Users} label="Size" compact={compact}>
          {room.capacity} {room.capacity === 1 ? 'seat' : 'seats'} per session
        </InfoRow>
        <InfoRow icon={Wallet} label="Price" compact={compact}>
          <RoomPrice room={room} />
        </InfoRow>
      </ul>
    </section>
  )
}
