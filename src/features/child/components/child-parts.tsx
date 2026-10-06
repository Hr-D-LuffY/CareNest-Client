import {
  CalendarDays,
  CalendarRange,
  HeartPulse,
  type LucideIcon,
  Pencil,
  Phone,
  Sun,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TIER_LABEL } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { type Child, Tier } from '@/types'

// Small pieces every design of the children list is built from, so a child looks the same
// whichever layout shows it. Plain markup, no hooks.

export type ChildListProps = {
  items: readonly Child[]
  onEdit: (child: Child) => void
  onDelete: (child: Child) => void
  // Open the child's full profile: a click, a tap or Enter on the card.
  onView: (child: Child) => void
}

const TIER_ICON: Record<Tier, LucideIcon> = {
  [Tier.DAILY]: Sun,
  [Tier.WEEKLY]: CalendarDays,
  [Tier.MONTHLY]: CalendarRange,
}

// Not a status, so it does not go through StatusBadge: it is the child's care tier.
export function TierBadge({ tier, className }: { tier: Tier; className?: string }) {
  const Icon = TIER_ICON[tier]
  return (
    <Badge variant="secondary" className={cn('h-6 bg-info-soft px-2.5 text-info', className)}>
      <Icon aria-hidden="true" />
      {TIER_LABEL[tier]}
    </Badge>
  )
}

// Allergies and conditions as labelled chips (the label, not just the colour, says which is which).
export function HealthNotes({ child }: { child: Child }) {
  if (!child.allergies && !child.conditions) {
    return <span className="text-sm text-muted-foreground">None noted</span>
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {child.allergies && (
        <li>
          <Badge
            variant="secondary"
            className="h-auto min-h-6 bg-warning-soft py-1 text-left whitespace-normal text-warning"
          >
            <TriangleAlert aria-hidden="true" />
            Allergies: {child.allergies}
          </Badge>
        </li>
      )}
      {child.conditions && (
        <li>
          <Badge
            variant="secondary"
            className="h-auto min-h-6 bg-info-soft py-1 text-left whitespace-normal text-info"
          >
            <HeartPulse aria-hidden="true" />
            Conditions: {child.conditions}
          </Badge>
        </li>
      )}
    </ul>
  )
}

// The emergency contact's name, and their number as a tap-to-call link.
export function EmergencyContact({ child, className }: { child: Child; className?: string }) {
  const dialable = child.emergencyContactPhone.replace(/[^\d+]/g, '')
  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', className)}>
      <span className="truncate text-sm font-medium">{child.emergencyContactName}</span>
      <a
        href={`tel:${dialable}`}
        className="relative z-10 inline-flex min-h-9 w-fit items-center gap-1.5 rounded-md text-sm text-info underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Phone aria-hidden="true" className="size-3.5" />
        {child.emergencyContactPhone}
        <span className="sr-only"> (call {child.emergencyContactName})</span>
      </a>
    </div>
  )
}

export function ChildActions({
  child,
  onEdit,
  onDelete,
  className,
}: {
  child: Child
  onEdit: (child: Child) => void
  onDelete: (child: Child) => void
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button type="button" variant="outline" className="h-10 px-3" onClick={() => onEdit(child)}>
        <Pencil aria-hidden="true" />
        Edit
        <span className="sr-only"> {child.name}</span>
      </Button>
      <Button
        type="button"
        variant="destructive"
        className="size-10"
        aria-label={`Delete ${child.name}`}
        onClick={() => onDelete(child)}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  )
}

export function ChildAvatar({ child, size }: { child: Child; size: number }) {
  return <UserAvatar name={child.name} photo={child.profilePhoto} size={size} />
}
