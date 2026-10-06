import { NotFoundView } from '@/components/shared/not-found-view'

// Shown when a page calls notFound(), for example a record that does not exist or is not yours.
export default function StaffNotFound() {
  return (
    <NotFoundView
      homeHref="/staff"
      homeLabel="Back to my tasks"
      description="We could not find that. It may not exist, or it may belong to someone else."
    />
  )
}
