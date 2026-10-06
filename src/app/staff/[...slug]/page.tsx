import { notFound } from 'next/navigation'

// A URL inside this area that matches no page. Without this, Next shows the app-wide 404 (no
// sidebar). Calling notFound() here shows this area's own not-found.tsx inside its layout.
export default function UnknownPage() {
  notFound()
}
