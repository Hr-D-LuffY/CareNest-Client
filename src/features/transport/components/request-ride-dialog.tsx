'use client'

import { Bus, CircleAlert } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { FormError } from '@/components/forms/form-error'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useGuardianProfile } from '@/features/guardian/guardian.queries'
import { TopUpLink } from '@/features/wallet/components/top-up-link'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import { ADDRESS_MAX_LENGTH, TRANSPORT_BASE_FARE, VEHICLE_TYPE_LABEL } from '@/lib/constants'
import { formatBDT, formatSessionDate } from '@/lib/format'
import type { Booking, Vehicle } from '@/types'
import { VEHICLES_PARAMS } from '../transport.params'
import { useRequestRide, useVehiclesQuery } from '../transport.queries'
import {
  EMPTY_RIDE_FORM,
  type RideFormInput,
  rideFormSchema,
  toRidePayload,
} from '../transport.schema'

const FIELD_NAMES = ['vehicleId', 'pickupAddress', 'dropoffAddress'] as const
// The backend answers 402 when the wallet is below the base fare.
const PAYMENT_REQUIRED = 402
const SKELETON_IDS = ['a', 'b', 'c', 'd'] as const

type RideError = { message: string; status: number }

type RequestRideDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: Booking
}

function toVehicleOption(vehicle: Vehicle) {
  return {
    value: vehicle.id,
    label: `${vehicle.plateNumber} · ${VEHICLE_TYPE_LABEL[vehicle.vehicleType]}`,
    description: `${vehicle.driver.user.name} · ${vehicle.capacity} seats · ${formatBDT(vehicle.driver.perMinuteRate)} per minute`,
  }
}

// Request a ride for a booking: pick a vehicle, say where from and where to. The form is mounted
// only while the dialog is open, so every opening starts empty.
export function RequestRideDialog({ open, onOpenChange, booking }: RequestRideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <RideForm booking={booking} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function RideForm({ booking, onDone }: { booking: Booking; onDone: () => void }) {
  const requestRide = useRequestRide()
  const vehicles = useVehiclesQuery(VEHICLES_PARAMS, true)
  const profile = useGuardianProfile()
  const [error, setError] = useState<RideError | null>(null)

  const balance = profile.data?.guardianProfile.walletBalance
  // The balance when it is below the base fare, else null. Compared only, never added. The backend
  // still decides; this avoids a request that is sure to fail.
  const lowBalance = balance !== undefined && Number(balance) < TRANSPORT_BASE_FARE ? balance : null

  const form = useAppForm({
    defaultValues: EMPTY_RIDE_FORM as RideFormInput,
    validators: { onChange: rideFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setError(null)
      try {
        await requestRide.mutateAsync(toRidePayload(booking.id, value))
        toast.success(`Ride requested for ${booking.child.name}.`)
        onDone()
      } catch (failure) {
        // Field errors go under their field. Anything else (402 low wallet, 409 vehicle full or a
        // ride already requested, 429, offline) is shown above the button, word for word.
        if (!mapServerFieldErrors(formApi, failure, FIELD_NAMES)) {
          setError({
            message: getErrorMessage(failure),
            status: isApiError(failure) ? failure.status : 0,
          })
        }
      }
    },
  })

  function renderVehicles() {
    if (vehicles.isPending) {
      return (
        <div aria-busy="true" aria-live="polite" className="grid gap-2 sm:grid-cols-2">
          <span className="sr-only">Loading vehicles</span>
          {SKELETON_IDS.map((id) => (
            <Skeleton key={id} className="h-16 rounded-xl" />
          ))}
        </div>
      )
    }
    if (vehicles.isError) return <ListErrorState onRetry={() => vehicles.refetch()} />
    if (vehicles.data.items.length === 0) {
      return (
        <EmptyState
          bare
          icon={Bus}
          title="No vehicles available"
          description="No verified driver has a vehicle registered yet. Try again later."
        />
      )
    }
    return (
      <form.AppField name="vehicleId">
        {(field) => (
          <field.ChoiceField
            label="Vehicle"
            options={vehicles.data.items.map(toVehicleOption)}
            columnsClassName="sm:grid-cols-2"
            hint="A vehicle can be full on a date. If it is, the backend tells you and you can pick another."
          />
        )}
      </form.AppField>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DialogHeader className="border-b p-4 pr-14 sm:p-6 sm:pr-16">
        <DialogTitle className="text-xl sm:text-2xl">Request a ride</DialogTitle>
        <DialogDescription>
          A supervised ride for {booking.child.name} on {formatSessionDate(booking.sessionDate)}, to
          or from {booking.room.name}.
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
          {renderVehicles()}

          <form.AppField name="pickupAddress">
            {(field) => (
              <field.TextareaField
                label="Pickup address"
                rows={2}
                maxLength={ADDRESS_MAX_LENGTH}
                placeholder="House, road, area"
              />
            )}
          </form.AppField>
          <form.AppField name="dropoffAddress">
            {(field) => (
              <field.TextareaField
                label="Dropoff address"
                rows={2}
                maxLength={ADDRESS_MAX_LENGTH}
                placeholder="House, road, area"
              />
            )}
          </form.AppField>

          <p className="text-sm text-muted-foreground">
            The fare is a flat {formatBDT(TRANSPORT_BASE_FARE)} plus the minutes of the trip times
            the driver&apos;s per-minute rate. Nothing is charged now: the fare is taken from your
            wallet when the driver ends the trip.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t p-4 sm:p-6">
          {lowBalance !== null && (
            <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft p-3 text-sm">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
              <div className="flex flex-col gap-2">
                <p>
                  Your balance of {formatBDT(lowBalance)} is below the{' '}
                  {formatBDT(TRANSPORT_BASE_FARE)} base fare you need to request a ride.
                </p>
                <TopUpLink />
              </div>
            </div>
          )}
          <FormError message={error?.message ?? null} />
          {error?.status === PAYMENT_REQUIRED && <TopUpLink />}
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
                <form.SubmitButton disabled={lowBalance !== null}>Request ride</form.SubmitButton>
              </form.AppForm>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
