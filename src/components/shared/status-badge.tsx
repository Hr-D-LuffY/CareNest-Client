import {
  Ban,
  CheckCheck,
  CircleCheck,
  CircleX,
  Clock,
  Hourglass,
  type LucideIcon,
  Play,
  ShieldAlert,
  ShieldCheck,
  Timer,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type {
  BookingStatus,
  PaymentStatus,
  RoomStatus,
  TransportStatus,
  VerificationStatus,
  WaitlistStatus,
  WalletTransactionType,
} from '@/types/enums'

type Tone = 'success' | 'warning' | 'info' | 'danger' | 'neutral'

type StatusStyle = { label: string; tone: Tone; icon: LucideIcon }

// Which enum each `kind` reads its value from. PENDING and CANCELLED exist in several enums, so
// the badge is keyed by enum first, then by value.
type StatusValues = {
  booking: BookingStatus
  waitlist: WaitlistStatus
  payment: PaymentStatus
  transport: TransportStatus
  verification: VerificationStatus
  room: RoomStatus
  transaction: WalletTransactionType
}

export type StatusKind = keyof StatusValues

const TONE_CLASSES: Record<Tone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
  danger: 'bg-destructive-soft text-destructive',
  neutral: 'bg-muted text-muted-foreground',
}

// The one colour map for every status in the app. Each entry has an icon as well as a colour, so
// the meaning never depends on colour alone.
const STATUS_STYLES: { [K in StatusKind]: Record<StatusValues[K], StatusStyle> } = {
  booking: {
    PENDING: { label: 'Waitlisted', tone: 'warning', icon: Hourglass },
    CONFIRMED: { label: 'Confirmed', tone: 'success', icon: CircleCheck },
    CANCELLED: { label: 'Cancelled', tone: 'neutral', icon: Ban },
    COMPLETED: { label: 'Completed', tone: 'info', icon: CheckCheck },
  },
  waitlist: {
    PENDING: { label: 'Waiting', tone: 'warning', icon: Hourglass },
    PROMOTED: { label: 'Promoted', tone: 'success', icon: CircleCheck },
    EXPIRED: { label: 'Expired', tone: 'neutral', icon: Timer },
    CANCELLED: { label: 'Cancelled', tone: 'neutral', icon: Ban },
  },
  payment: {
    PENDING: { label: 'Pending', tone: 'warning', icon: Clock },
    SUCCESS: { label: 'Paid', tone: 'success', icon: CircleCheck },
    FAILED: { label: 'Failed', tone: 'danger', icon: CircleX },
    CANCELLED: { label: 'Cancelled', tone: 'neutral', icon: Ban },
  },
  transport: {
    REQUESTED: { label: 'Requested', tone: 'warning', icon: Clock },
    IN_PROGRESS: { label: 'On the way', tone: 'info', icon: Play },
    COMPLETED: { label: 'Completed', tone: 'success', icon: CheckCheck },
    CANCELLED: { label: 'Cancelled', tone: 'neutral', icon: Ban },
  },
  verification: {
    UNVERIFIED: { label: 'Unverified', tone: 'warning', icon: ShieldAlert },
    VERIFIED: { label: 'Verified', tone: 'success', icon: ShieldCheck },
    REJECTED: { label: 'Rejected', tone: 'danger', icon: CircleX },
  },
  room: {
    AVAILABLE: { label: 'Seats available', tone: 'success', icon: CircleCheck },
    FULL: { label: 'Full', tone: 'danger', icon: TriangleAlert },
  },
  transaction: {
    TOPUP: { label: 'Top-up', tone: 'success', icon: Wallet },
    CARE_FEE: { label: 'Care fee', tone: 'neutral', icon: Wallet },
    TRANSPORT_FARE: { label: 'Transport fare', tone: 'neutral', icon: Wallet },
  },
}

type StatusBadgeProps<K extends StatusKind> = {
  kind: K
  status: StatusValues[K]
  className?: string
}

// A coloured pill for any backend status enum, e.g. <StatusBadge kind="booking" status="PENDING" />.
// A booking in PENDING reads "Waitlisted" because that is what it means for the guardian.
export function StatusBadge<K extends StatusKind>({
  kind,
  status,
  className,
}: StatusBadgeProps<K>) {
  const styles: Record<StatusValues[K], StatusStyle> = STATUS_STYLES[kind]
  const { label, tone, icon: Icon } = styles[status]

  return (
    <Badge variant="secondary" className={cn('h-6 px-2.5', TONE_CLASSES[tone], className)}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  )
}
