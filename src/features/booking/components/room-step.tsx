'use client'

import { useStore } from '@tanstack/react-form'
import { getFieldError } from '@/components/forms/use-field-error'
import { useQueryParams } from '@/hooks/use-query-params'
import type { BookingFormApi } from '../use-booking-form'
import type { SelectedRoom } from '../use-selected-room'
import { RoomPicker } from './room-picker'
import { SessionPicker } from './session-picker'

type RoomStepProps = {
  form: BookingFormApi
  selected: SelectedRoom
}

// Step 2: pick a care room, then one of its session dates. Choosing a room also picks its next
// session, so the guardian only changes the date if they want a later one. Both picks go into the
// URL (?room=&date=), written in a single update because two quick updates would overwrite each
// other.
export function RoomStep({ form, selected }: RoomStepProps) {
  const query = useQueryParams()
  const roomId = useStore(form.store, (state) => state.values.roomId)

  return (
    <section aria-labelledby="step-heading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 id="step-heading" tabIndex={-1} className="text-xl outline-none">
          Pick a room and a session
        </h2>
        <p className="text-sm text-muted-foreground">
          A room repeats every week, so choose the date you need. A full session puts your child on
          the waitlist instead of turning you away.
        </p>
      </div>

      <form.AppField name="roomId">
        {(field) => (
          <RoomPicker
            value={field.state.value}
            error={getFieldError(field)}
            onPick={(room) => {
              if (room.id === field.state.value) return
              field.handleChange(room.id)
              form.setFieldValue('sessionDate', room.sessionDate)
              query.set({ room: room.id, date: room.sessionDate })
            }}
          />
        )}
      </form.AppField>

      {roomId !== '' && (
        <form.AppField name="sessionDate">
          {(field) => (
            <SessionPicker
              selected={selected}
              value={field.state.value}
              error={getFieldError(field)}
              onPick={(date) => {
                field.handleChange(date)
                query.set({ date })
              }}
            />
          )}
        </form.AppField>
      )}
    </section>
  )
}
