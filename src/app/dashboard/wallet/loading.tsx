import { DataTableSkeleton } from '@/components/shared/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { WALLET_PAGE_SIZE } from '@/features/wallet/wallet.params'

// Same shape as the page: header, balance and top-up cards, history title, filters, then the table.
export default function WalletLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32 md:h-9" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Skeleton className="h-44 w-full rounded-3xl sm:h-48" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-2">
          {['all', 'topups', 'care', 'rides'].map((id) => (
            <Skeleton key={id} className="h-10 w-24 rounded-lg" />
          ))}
        </div>
        <DataTableSkeleton columns={5} rows={WALLET_PAGE_SIZE} />
      </div>
    </div>
  )
}
