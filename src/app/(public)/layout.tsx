import type { ReactNode } from 'react'
import { PublicFooter } from '@/components/layout/public-footer'
import { PublicNavbar } from '@/components/layout/public-navbar'

// Shell for every public page: skip link, sticky navbar, content, footer.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to main content
      </a>
      <PublicNavbar />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
