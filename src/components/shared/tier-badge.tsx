import { CalendarDays, CalendarRange, type LucideIcon, Sun } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TIER_LABEL } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Tier } from '@/types/enums'

const TIER_ICON: Record<Tier, LucideIcon> = {
  [Tier.DAILY]: Sun,
  [Tier.WEEKLY]: CalendarDays,
  [Tier.MONTHLY]: CalendarRange,
}

// A care tier (Daily, Weekly, Monthly) on a child or a room. Not a status, so it does not go
// through StatusBadge. Plain markup with no hooks.
export function TierBadge({ tier, className }: { tier: Tier; className?: string }) {
  const Icon = TIER_ICON[tier]
  return (
    <Badge variant="secondary" className={cn('h-6 bg-info-soft px-2.5 text-info', className)}>
      <Icon aria-hidden="true" />
      {TIER_LABEL[tier]}
    </Badge>
  )
}
