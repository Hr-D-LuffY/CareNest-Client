import { RotateCw, TriangleAlert } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'

// What every list shows when its request failed: say so, and offer a retry. Plain markup with no
// hooks, so Server and Client Components can both render it.
export function ListErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={TriangleAlert}
      title="Could not load this list"
      description="Something went wrong while fetching the data. Check your connection and try again."
      action={
        onRetry && (
          <Button type="button" variant="outline" className="h-10 px-4" onClick={onRetry}>
            <RotateCw aria-hidden="true" />
            Try again
          </Button>
        )
      }
    />
  )
}
