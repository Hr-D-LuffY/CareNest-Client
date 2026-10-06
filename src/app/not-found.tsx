import { NotFoundView } from '@/components/shared/not-found-view'

// Any URL that matches no route, anywhere in the app.
export default function NotFound() {
  return <NotFoundView homeHref="/" homeLabel="Back to home" fullPage />
}
