import type { Metadata } from 'next'
import { Nunito_Sans, Varela_Round } from 'next/font/google'
import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
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
  title: 'CareNest',
  description: 'Trusted childcare and supervised transport for your little ones.',
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
