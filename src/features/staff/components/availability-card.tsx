'use client'

import { CalendarClock, Pencil, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DAY_LABEL } from '@/lib/constants'
import { type AvailabilitySlot, DAYS_OF_WEEK, type DayOfWeek } from '@/types'
import { formatSlot, groupSlotsByDay } from '../availability-model'
import { useDeleteSlot, useStaffAvailabilityQuery } from '../staff.queries'
import { SlotFormDialog } from './slot-form-dialog'

type FormState = { open: boolean; slot: AvailabilitySlot | null; day: DayOfWeek | null }

// The days and hours the staff member works: a week with each day's times, and add, edit and remove.
// A day with no time is a day they do not work. The Tasks calendar reads the same list to mark which
// days are available. Removing is optimistic: the time goes at once and comes back if the backend
// refuses.
export function AvailabilityCard({ staffId }: { staffId: string }) {
  const { data, isPending, isError, refetch } = useStaffAvailabilityQuery(staffId)
  const deleteSlot = useDeleteSlot(staffId)
  const [formState, setFormState] = useState<FormState>({ open: false, slot: null, day: null })
  const [slotToDelete, setSlotToDelete] = useState<AvailabilitySlot | null>(null)

  // `slot` is the one being edited, or null to add a new one on `day`.
  function openForm(slot: AvailabilitySlot | null, day: DayOfWeek | null = null) {
    setFormState({ open: true, slot, day })
  }

  function renderBody() {
    if (isPending) {
      return (
        <div aria-busy="true" aria-live="polite" className="flex flex-col gap-3">
          <span className="sr-only">Loading your availability</span>
          {DAYS_OF_WEEK.map((day) => (
            <Skeleton key={day} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      )
    }
    if (isError || !data) return <ListErrorState onRetry={() => refetch()} />

    if (data.length === 0) {
      return (
        <EmptyState
          bare
          icon={CalendarClock}
          title="No times set yet"
          description="Add the days and hours you can work. Until you do, your calendar shows every day as one you are not available."
          action={
            <Button
              type="button"
              className="h-11 bg-cta px-5 font-semibold text-cta-foreground hover:bg-cta/90"
              onClick={() => openForm(null)}
            >
              <Plus aria-hidden="true" />
              Add your first time
            </Button>
          }
        />
      )
    }

    return (
      <ul aria-label="Your week" className="divide-y">
        {groupSlotsByDay(data).map(({ day, slots }) => (
          <li
            key={day}
            className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-6"
          >
            <span className="w-28 shrink-0 text-sm font-medium">{DAY_LABEL[day]}</span>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              {slots.length === 0 ? (
                <span className="text-sm text-muted-foreground">Not available</span>
              ) : (
                slots.map((slot) => (
                  <span
                    key={slot.id}
                    className="inline-flex items-center gap-1 rounded-full bg-linear-to-br from-primary/20 via-info-soft to-card py-1 pr-1 pl-3.5 text-sm ring-1 ring-primary/25"
                  >
                    <span className="tabular-nums">{formatSlot(slot)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-9 rounded-full"
                      onClick={() => openForm(slot)}
                    >
                      <Pencil aria-hidden="true" />
                      <span className="sr-only">
                        Edit {DAY_LABEL[day]} {formatSlot(slot)}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-9 rounded-full text-destructive hover:text-destructive"
                      onClick={() => setSlotToDelete(slot)}
                    >
                      <X aria-hidden="true" />
                      <span className="sr-only">
                        Remove {DAY_LABEL[day]} {formatSlot(slot)}
                      </span>
                    </Button>
                  </span>
                ))
              )}
              <Button
                type="button"
                variant="ghost"
                className="h-9 px-3 text-muted-foreground"
                onClick={() => openForm(null, day)}
              >
                <Plus aria-hidden="true" />
                Add
                <span className="sr-only"> a time on {DAY_LABEL[day]}</span>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="font-heading text-lg">Availability</CardTitle>
          <CardDescription>
            The days and hours you work. Days you work are shaded on your Tasks calendar.
          </CardDescription>
        </div>
        {data && data.length > 0 && (
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 px-4"
            onClick={() => openForm(null)}
          >
            <Plus aria-hidden="true" />
            Add a time
          </Button>
        )}
      </CardHeader>
      <CardContent>{renderBody()}</CardContent>

      <SlotFormDialog
        open={formState.open}
        onOpenChange={(open) => setFormState((current) => ({ ...current, open }))}
        staffId={staffId}
        slot={formState.slot}
        defaultDay={formState.day}
      />

      <ConfirmDialog
        open={slotToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setSlotToDelete(null)
        }}
        title={
          slotToDelete
            ? `Remove ${DAY_LABEL[slotToDelete.dayOfWeek]} ${formatSlot(slotToDelete)}?`
            : 'Remove this time?'
        }
        description="You will no longer show as available then. Bookings you already have are not cancelled."
        confirmLabel="Remove time"
        cancelLabel="Keep time"
        onConfirm={() => {
          if (slotToDelete) deleteSlot.mutate(slotToDelete.id)
          setSlotToDelete(null)
        }}
      />
    </Card>
  )
}
