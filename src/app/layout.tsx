import type { Metadata } from 'next'
import { Nunito_Sans, Varela_Round } from 'next/font/google'
import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { publicEnv } from '@/lib/public-env'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import './globals.css'

const nunito = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

const varela = Varela_Round({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-varela',
  display: 'swap',
})

export const metadata: Metadata = {
  // Makes every relative URL in the metadata (the share image, the sitemap) absolute.
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_APP_URL),
  title: { default: 'CareNest', template: '%s | CareNest' },
  description: 'Trusted childcare and supervised transport for your little ones.',
  applicationName: 'CareNest',
  openGraph: { siteName: 'CareNest', type: 'website', locale: 'en_US' },
  // The share image itself is app/opengraph-image.png; X falls back to it for twitter:image.
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${varela.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
