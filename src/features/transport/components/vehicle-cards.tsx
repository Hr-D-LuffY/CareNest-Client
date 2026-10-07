import { Bus, Car, Pencil, Trash2, Truck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VEHICLE_TYPE_LABEL } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import { type Vehicle, VehicleType } from '@/types'

const TYPE_ICON = {
  [VehicleType.CAR]: Car,
  [VehicleType.VAN]: Truck,
  [VehicleType.BUS]: Bus,
} as const

type VehicleCardsProps = {
  items: readonly Vehicle[]
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
}

// The driver's vehicles as cards: the plate drawn like a number plate, the type, seats and when it
// was added, with Edit and Remove.
export function VehicleCards({ items, onEdit, onDelete }: VehicleCardsProps) {
  return (
    <ul aria-label="Your vehicles" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((vehicle) => {
        const Icon = TYPE_ICON[vehicle.vehicleType]
        return (
          <li
            key={vehicle.id}
            className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-soft motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info"
              >
                <Icon className="size-6" />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <p className="w-fit max-w-full rounded-md border-2 border-foreground/70 px-2 py-0.5 font-heading text-lg tracking-wider break-all">
                  {vehicle.plateNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  {VEHICLE_TYPE_LABEL[vehicle.vehicleType]}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col">
                <dt className="text-xs text-muted-foreground">Seats</dt>
                <dd className="flex items-center gap-1.5 tabular-nums">
                  <Users aria-hidden="true" className="size-4 text-muted-foreground" />
                  {vehicle.capacity}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xs text-muted-foreground">Added</dt>
                <dd>{formatDate(vehicle.createdAt)}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2 border-t pt-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 flex-1 px-3"
                onClick={() => onEdit(vehicle)}
              >
                <Pencil aria-hidden="true" />
                Edit
                <span className="sr-only"> {vehicle.plateNumber}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 flex-1 px-3 text-destructive hover:text-destructive"
                onClick={() => onDelete(vehicle)}
              >
                <Trash2 aria-hidden="true" />
                Remove
                <span className="sr-only"> {vehicle.plateNumber}</span>
              </Button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
