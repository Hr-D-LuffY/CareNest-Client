import { NotFoundView } from '@/components/shared/not-found-view'

// Shown when a page calls notFound(), for example a record that does not exist or is not yours.
export default function GuardianNotFound() {
  return (
    <NotFoundView
      homeHref="/dashboard"
      homeLabel="Back to dashboard"
      description="We could not find that. It may not exist, or it may belong to someone else."
    />
  )
}
