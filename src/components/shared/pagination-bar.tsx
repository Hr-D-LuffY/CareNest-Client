import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PaginationMeta } from '@/types/api'

type PaginationBarProps = {
  meta: PaginationMeta
  onPageChange: (page: number) => void
  // Disables the buttons while the next page is loading.
  disabled?: boolean
  className?: string
}

type PageItem = number | 'gap-start' | 'gap-end'

// 1 … 4 5 6 … 20: always the first and last page, the current one and one neighbour each side.
function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const items: PageItem[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)

  if (start > 2) items.push('gap-start')
  for (let p = start; p <= end; p++) items.push(p)
  if (end < totalPages - 1) items.push('gap-end')
  items.push(totalPages)
  return items
}

// Footer of every paginated list. It only reports the page the user picked, so the caller decides
// where it lives (the URL, through useQueryParams). On phones only Previous / Next and "Page x of
// y" show; the numbered buttons appear from the sm breakpoint.
export function PaginationBar({ meta, onPageChange, disabled, className }: PaginationBarProps) {
  const { page, limit, total } = meta
  if (total <= 0) return null

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className={cn('flex flex-col items-center justify-between gap-3 sm:flex-row', className)}>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground tabular-nums">{from}</span> to{' '}
        <span className="font-semibold text-foreground tabular-nums">{to}</span> of{' '}
        <span className="font-semibold text-foreground tabular-nums">{total}</span>
      </p>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-3"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft aria-hidden="true" />
            Previous
          </Button>

          <span className="px-2 text-sm text-muted-foreground tabular-nums sm:hidden">
            Page {page} of {totalPages}
          </span>

          <ul className="hidden items-center gap-1 sm:flex">
            {getPageItems(page, totalPages).map((item) =>
              typeof item === 'number' ? (
                <li key={item}>
                  <Button
                    type="button"
                    variant={item === page ? 'default' : 'ghost'}
                    className="size-10 tabular-nums"
                    disabled={disabled}
                    aria-label={`Page ${item}`}
                    aria-current={item === page ? 'page' : undefined}
                    onClick={() => onPageChange(item)}
                  >
                    {item}
                  </Button>
                </li>
              ) : (
                <li key={item} aria-hidden="true" className="px-1 text-muted-foreground">
                  …
                </li>
              ),
            )}
          </ul>

          <Button
            type="button"
            variant="outline"
            className="h-10 px-3"
            disabled={disabled || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
            <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      )}
    </div>
  )
}
