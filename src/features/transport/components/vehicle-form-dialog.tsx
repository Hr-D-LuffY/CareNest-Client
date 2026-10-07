'use client'

import { Hash, Users } from 'lucide-react'
import { FormError } from '@/components/forms/form-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VEHICLE_MAX_CAPACITY, VEHICLE_MIN_CAPACITY, VEHICLE_TYPE_LABEL } from '@/lib/constants'
import { type Vehicle, VehicleType } from '@/types'
import { useVehicleForm } from '../use-vehicle-form'

const TYPE_OPTIONS = Object.values(VehicleType).map((value) => ({
  value,
  label: VEHICLE_TYPE_LABEL[value],
}))

type VehicleFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // The vehicle being edited, or null to add a new one.
  vehicle: Vehicle | null
}

// Add or edit a vehicle in a modal. The form inside is mounted only while the modal is open, so every
// opening starts from the right values.
export function VehicleFormDialog({ open, onOpenChange, vehicle }: VehicleFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <VehicleForm vehicle={vehicle} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function VehicleForm({ vehicle, onDone }: { vehicle: Vehicle | null; onDone: () => void }) {
  const { form, serverError } = useVehicleForm(vehicle, onDone)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DialogHeader className="border-b p-4 pr-14 sm:p-6 sm:pr-16">
        <DialogTitle className="text-xl sm:text-2xl">
          {vehicle ? `Edit ${vehicle.plateNumber}` : 'Add a vehicle'}
        </DialogTitle>
        <DialogDescription>
          Guardians pick from the vehicles of verified drivers when they request a ride.
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
          <form.AppField name="plateNumber">
            {(field) => (
              <field.TextField
                label="Plate number"
                icon={Hash}
                autoComplete="off"
                placeholder="e.g. DHAKA METRO 12-3456"
                hint="Shown to guardians. It is saved in capital letters, and each plate can be registered once."
              />
            )}
          </form.AppField>

          <form.AppField name="vehicleType">
            {(field) => <field.ChoiceField label="Vehicle type" options={TYPE_OPTIONS} />}
          </form.AppField>

          <form.AppField name="capacity">
            {(field) => (
              <field.TextField
                label="Seats for children"
                icon={Users}
                inputMode="numeric"
                autoComplete="off"
                placeholder="e.g. 8"
                hint={`Between ${VEHICLE_MIN_CAPACITY} and ${VEHICLE_MAX_CAPACITY}. Riders on the same day share the vehicle, so it cannot go below the riders already requested.`}
              />
            )}
          </form.AppField>
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
                <form.SubmitButton>{vehicle ? 'Save changes' : 'Add vehicle'}</form.SubmitButton>
              </form.AppForm>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
