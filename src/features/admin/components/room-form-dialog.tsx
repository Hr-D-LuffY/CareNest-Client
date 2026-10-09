'use client'

import { DoorOpen, Hash, Percent } from 'lucide-react'
import Link from 'next/link'
import { FormError } from '@/components/forms/form-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DAY_LABEL,
  ROOM_MAX_CAPACITY,
  ROOM_MIN_CAPACITY,
  STAFF_TYPE_LABEL,
  TIER_LABEL,
} from '@/lib/constants'
import { formatBDT } from '@/lib/format'
import { DAYS_OF_WEEK, type Room, type StaffProfile, Tier } from '@/types'
import { useAssignableStaffQuery } from '../admin-staff.queries'
import { useRoomForm } from '../use-room-form'
import { RoomStaffHours } from './room-staff-hours'

const TIER_OPTIONS = [
  { value: Tier.DAILY, label: TIER_LABEL.DAILY, description: 'Day-by-day care' },
  { value: Tier.WEEKLY, label: TIER_LABEL.WEEKLY, description: 'A standing weekly place' },
  { value: Tier.MONTHLY, label: TIER_LABEL.MONTHLY, description: 'The longest commitment' },
] as const

const DAY_OPTIONS = DAYS_OF_WEEK.map((value) => ({ value, label: DAY_LABEL[value] }))

type RoomFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // The room being edited, or null to add a new one.
  room: Room | null
}

// Add or edit a care room in a modal. The form inside is mounted only while the modal is open, so
// every opening starts from the right values.
export function RoomFormDialog({ open, onOpenChange, room }: RoomFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <RoomForm room={room} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

// A sitter in the staff dropdown: name, type and the hourly rate the room price is built from.
function staffLabel(staff: StaffProfile) {
  const rate = staff.hourlyRate !== null ? `, ${formatBDT(staff.hourlyRate)}/hour` : ''
  return `${staff.user.name} (${STAFF_TYPE_LABEL[staff.staffType]}${rate})`
}

function RoomForm({ room, onDone }: { room: Room | null; onDone: () => void }) {
  const { form, serverError } = useRoomForm(room, onDone)
  const staff = useAssignableStaffQuery()

  // The sitter the room has now is always offered, so the field shows them even if they have since
  // stopped being assignable (the backend only re-checks a sitter when the room is moved to one).
  const options = (staff.data ?? []).map((person) => ({
    value: person.id,
    label: staffLabel(person),
  }))
  if (room && !options.some((option) => option.value === room.staff.id)) {
    options.unshift({
      value: room.staff.id,
      label: `${room.staff.user.name} (${STAFF_TYPE_LABEL[room.staff.staffType]})`,
    })
  }

  let staffHint: string | undefined
  if (staff.isPending) staffHint = 'Loading verified sitters…'
  else if (staff.isError) staffHint = 'Could not load the sitters. Close this and try again.'
  else if (options.length === 0) {
    staffHint = 'No verified sitter yet. Verify a sitter in Staff first.'
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DialogHeader className="border-b p-4 pr-14 sm:p-6 sm:pr-16">
        <DialogTitle className="text-xl sm:text-2xl">
          {room ? `Edit ${room.name}` : 'Add a care room'}
        </DialogTitle>
        <DialogDescription>
          A room repeats every week on its day. Only a verified sitter who works those hours and is
          not running another room then can be given it.
        </DialogDescription>
      </DialogHeader>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4 sm:p-6">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Room name"
                icon={DoorOpen}
                autoComplete="off"
                placeholder="e.g. Sunshine Room"
              />
            )}
          </form.AppField>

          <form.AppField name="tier">
            {(field) => <field.ChoiceField label="Care tier" options={TIER_OPTIONS} />}
          </form.AppField>

          <div className="grid gap-5 sm:grid-cols-3">
            <form.AppField name="dayOfWeek">
              {(field) => <field.SelectField label="Day" options={DAY_OPTIONS} />}
            </form.AppField>
            <form.AppField name="startTime">
              {(field) => <field.TimeField label="From" />}
            </form.AppField>
            <form.AppField name="endTime">
              {(field) => <field.TimeField label="Until" />}
            </form.AppField>
          </div>

          <form.AppField name="staffId">
            {(field) => (
              <field.SelectField
                label="Run by"
                options={options}
                placeholder={staff.isPending ? 'Loading…' : 'Choose a sitter'}
                disabled={staff.isPending}
                hint={staffHint}
              />
            )}
          </form.AppField>
          {staff.isSuccess && options.length === 0 && (
            <Link
              href="/admin/staff"
              className="-mt-3 w-fit rounded-md text-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Go to Staff
            </Link>
          )}

          <form.Subscribe
            selector={(state) => [state.values.staffId, state.values.dayOfWeek] as const}
          >
            {([staffId, day]) => <RoomStaffHours staffId={staffId} day={day} />}
          </form.Subscribe>

          <div className="grid gap-5 sm:grid-cols-2">
            <form.AppField name="capacity">
              {(field) => (
                <field.TextField
                  label="Seats"
                  icon={Hash}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="e.g. 8"
                  hint={`Between ${ROOM_MIN_CAPACITY} and ${ROOM_MAX_CAPACITY}. It cannot go below the seats already booked on an upcoming day.`}
                />
              )}
            </form.AppField>
            <form.AppField name="priceMultiplier">
              {(field) => (
                <field.TextField
                  label="Price multiplier"
                  icon={Percent}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="1"
                  hint="1 charges the sitter's hourly rate. 1.5 charges half as much again."
                />
              )}
            </form.AppField>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t p-4 sm:p-6">
          <FormError message={serverError} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl px-6"
              onClick={onDone}
            >
              Cancel
            </Button>
            <div className="sm:w-56">
              <form.AppForm>
                <form.SubmitButton>{room ? 'Save changes' : 'Add room'}</form.SubmitButton>
              </form.AppForm>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
