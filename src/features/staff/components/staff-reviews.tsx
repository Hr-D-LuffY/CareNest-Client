'use client'

import { MessageSquareText } from 'lucide-react'
import { useEffect } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { StarRating } from '@/components/shared/star-rating'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryParams } from '@/hooks/use-query-params'
import { formatDate, formatShortName } from '@/lib/format'
import { cn } from '@/lib/utils'
import { REVIEWS_PAGE_SIZE } from '../staff.params'
import { useStaffRatingsQuery } from '../staff.queries'

const SKELETON_IDS = ['a', 'b', 'c'] as const

function ReviewsSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">Loading reviews</span>
      {SKELETON_IDS.map((id) => (
        <div key={id} className="flex flex-col gap-2 rounded-xl border p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
}

type StaffReviewsProps = {
  staffId: string
  staffName: string
}

// What guardians wrote about the staff member, newest first, five to a page. The page number lives
// in the URL (?page=), and the server page has already loaded the first one.
export function StaffReviews({ staffId, staffName }: StaffReviewsProps) {
  const query = useQueryParams()
  const page = query.getPage()
  const { data, isPending, isError, isFetching, refetch } = useStaffRatingsQuery(staffId, {
    page,
    limit: REVIEWS_PAGE_SIZE,
  })

  const lastPage = data ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1

  // A hand-edited ?page=9 leaves an empty page. Step back to the last page that has reviews.
  useEffect(() => {
    if (data && data.count > 0 && page > lastPage) query.setPage(lastPage)
  }, [data, page, lastPage, query])

  function renderBody() {
    if (isPending) return <ReviewsSkeleton />
    if (isError && !data) return <ListErrorState onRetry={() => refetch()} />
    if (!data || data.count === 0) {
      return (
        <EmptyState
          bare
          icon={MessageSquareText}
          title="No reviews yet"
          description={`${staffName} has not been rated yet. Reviews appear here after guardians complete a session.`}
        />
      )
    }

    return (
      <ul className="flex flex-col gap-3">
        {data.reviews.map((review) => (
          <li key={review.id} className="flex flex-col gap-2 rounded-xl border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2">
                <StarRating value={review.score} />
                <span className="text-sm font-semibold">
                  {formatShortName(review.guardian.user.name)}
                </span>
              </p>
              <time dateTime={review.createdAt} className="text-xs text-muted-foreground">
                {formatDate(review.createdAt)}
              </time>
            </div>
            {review.comment ? (
              <p className="text-sm break-words text-pretty">{review.comment}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No comment left.</p>
            )}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="flex scroll-mt-24 flex-col gap-4 rounded-2xl border bg-card p-4 shadow-soft sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="reviews-heading" className="text-xl">
          Reviews
        </h2>
        {data && data.count > 0 && (
          <p className="flex items-center gap-2 text-sm">
            <StarRating value={data.average} />
            <span className="font-semibold tabular-nums">{data.average.toFixed(1)}</span>
            <span className="text-muted-foreground">
              from {data.count} {data.count === 1 ? 'review' : 'reviews'}
            </span>
          </p>
        )}
      </div>

      <div
        aria-busy={isFetching || undefined}
        className={cn('transition-opacity', isFetching && !isPending && 'opacity-60')}
      >
        {renderBody()}
      </div>

      {data && data.reviews.length > 0 && (
        <PaginationBar meta={data.meta} onPageChange={query.setPage} disabled={isFetching} />
      )}
    </section>
  )
}
