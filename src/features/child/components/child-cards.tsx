import { Phone, Stethoscope } from 'lucide-react'
import { formatAge, formatDate } from '@/lib/format'
import type { Child } from '@/types'
import {
  ChildActions,
  ChildAvatar,
  type ChildListProps,
  EmergencyContact,
  HealthNotes,
  TierBadge,
} from './child-parts'

type ChildCardProps = Pick<ChildListProps, 'onEdit' | 'onDelete' | 'onView'> & {
  child: Child
}

function ChildCard({ child, onEdit, onDelete, onView }: ChildCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border bg-linear-to-br from-info-soft via-card to-card shadow-card transition-shadow duration-200 hover:shadow-float">
      {/* Clicking this part opens the profile. The name is the real button: it is stretched over
          the whole area, so the card is one big target for mouse, touch and keyboard. The actions
          row below is outside it, so Edit and Delete never open the profile. */}
      <div className="relative flex flex-1 flex-col">
        <div className="flex items-start gap-4 p-4 sm:p-5">
          <ChildAvatar child={child} size={96} />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h2 className="font-heading text-lg leading-tight break-words">
              <button
                type="button"
                onClick={() => onView(child)}
                className="cursor-pointer text-left outline-none after:absolute after:inset-0 after:rounded-t-2xl after:content-[''] focus-visible:after:ring-3 focus-visible:after:ring-ring/50 focus-visible:after:ring-inset"
              >
                {child.name}
                <span className="sr-only">, open profile</span>
              </button>
            </h2>
            <p className="text-sm text-muted-foreground">
              {formatAge(child.dateOfBirth)} · born {formatDate(child.dateOfBirth)}
            </p>
            <TierBadge tier={child.tier} />
          </div>
        </div>

        <dl className="flex flex-1 flex-col gap-4 border-t px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-2">
            <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <Stethoscope aria-hidden="true" className="size-3.5" />
              Health notes
            </dt>
            <dd>
              <HealthNotes child={child} />
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <Phone aria-hidden="true" className="size-3.5" />
              Emergency contact
            </dt>
            <dd>
              <EmergencyContact child={child} />
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex justify-end border-t bg-muted/40 px-4 py-3 sm:px-5">
        <ChildActions child={child} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </article>
  )
}

// Photo-forward cards in a grid: who the child is first, then health notes and the emergency
// contact, with the actions on the card's foot. A soft gradient from the theme's warm tint and a
// lifted shadow make each card read as its own surface. No entrance animation: the list changes
// with every filter, sort, page and add (a card that mounts after the page loaded would stay
// hidden), and data lists should not animate anyway.
export function ChildCards({ items, onEdit, onDelete, onView }: ChildListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((child) => (
        <ChildCard
          key={child.id}
          child={child}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  )
}
