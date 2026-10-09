'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { useCreateRoom, useUpdateRoom } from '@/features/room/room.queries'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage } from '@/lib/api/errors'
import type { Room } from '@/types'
import {
  EMPTY_ROOM_FORM,
  type RoomFormInput,
  roomFormSchema,
  toCreateRoomPayload,
  toRoomChanges,
  toRoomFormValues,
} from './admin-room.schema'

const FIELD_NAMES = [
  'name',
  'tier',
  'capacity',
  'dayOfWeek',
  'startTime',
  'endTime',
  'priceMultiplier',
  'staffId',
] as const

// The add / edit room form, without any layout. Adding sends every field. Editing sends only what
// changed, and refuses to send nothing (the backend wants at least one field).
export function useRoomForm(room: Room | null, onDone: () => void) {
  const createRoom = useCreateRoom()
  const updateRoom = useUpdateRoom()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: (room ? toRoomFormValues(room) : EMPTY_ROOM_FORM) as RoomFormInput,
    validators: { onChange: roomFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)

      try {
        if (room) {
          const changes = toRoomChanges(value, room)
          if (Object.keys(changes).length === 0) {
            setServerError('Change at least one detail to save.')
            return
          }
          const saved = await updateRoom.mutateAsync({ id: room.id, payload: changes })
          toast.success(`${saved.name} was updated.`)
        } else {
          const saved = await createRoom.mutateAsync(toCreateRoomPayload(value))
          toast.success(`${saved.name} was created.`)
        }
        onDone()
      } catch (error) {
        // Field errors go under their field. Everything else is shown above the button, word for
        // word: the sitter is not free or not available then (400, 409), the schedule or capacity
        // cannot change while children hold seats (409), 429, offline.
        if (mapServerFieldErrors(formApi, error, FIELD_NAMES)) return
        setServerError(getErrorMessage(error))
      }
    },
  })

  return { form, serverError, isEdit: room !== null }
}

export type RoomFormApi = ReturnType<typeof useRoomForm>['form']
