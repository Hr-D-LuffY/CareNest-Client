'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { mapServerFieldErrors, setServerFieldError } from '@/components/forms/server-errors'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import type { Vehicle } from '@/types'
import { useCreateVehicle, useUpdateVehicle } from './transport.queries'
import {
  EMPTY_VEHICLE_FORM,
  toVehicleChanges,
  toVehicleFormValues,
  toVehiclePayload,
  type VehicleFormInput,
  vehicleFormSchema,
} from './vehicle.schema'

const FIELD_NAMES = ['plateNumber', 'capacity', 'vehicleType'] as const

// The add / edit vehicle form, without any layout. Adding sends every field. Editing sends only what
// changed, and refuses to send nothing (the backend wants at least one field).
export function useVehicleForm(vehicle: Vehicle | null, onDone: () => void) {
  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: (vehicle
      ? toVehicleFormValues(vehicle)
      : EMPTY_VEHICLE_FORM) as VehicleFormInput,
    validators: { onChange: vehicleFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)

      try {
        if (vehicle) {
          const changes = toVehicleChanges(value, vehicle)
          if (Object.keys(changes).length === 0) {
            setServerError('Change at least one detail to save.')
            return
          }
          const saved = await updateVehicle.mutateAsync({ id: vehicle.id, payload: changes })
          toast.success(`${saved.plateNumber} was updated.`)
        } else {
          const saved = await createVehicle.mutateAsync(toVehiclePayload(value))
          toast.success(`${saved.plateNumber} was added.`)
        }
        onDone()
      } catch (error) {
        // Field errors go under their field. A plate that is already registered comes as a plain 409
        // message, so it is put under the plate field too. Anything else (a capacity that would push
        // riders out, 429, offline) is shown above the button, word for word.
        if (mapServerFieldErrors(formApi, error, FIELD_NAMES)) return
        if (isApiError(error) && error.status === 409 && /plate/i.test(error.message)) {
          setServerFieldError(formApi, 'plateNumber', error.message)
          return
        }
        setServerError(getErrorMessage(error))
      }
    },
  })

  return { form, serverError, isEdit: vehicle !== null }
}
