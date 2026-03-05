import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'SaheliAI — Your AI Family Assistant',
  description: 'The intelligent assistant that manages birthdays, medicines, and school events for Indian families — so you can be present for the moments that matter.',
  keywords: 'SaheliAI, Indian families, cognitive load, birthday reminders, medicine tracking, school events, AI assistant',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#5b2d8e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        {/* Main content — Navigation adds the top bar and bottom tab bar */}
        <Navigation />
        <main style={{
          width: '100%',
          maxWidth: '430px',
          margin: '0 auto',
          minHeight: '100dvh',
          position: 'relative',
        }}>
          {children}
        </main>
      </body>
    </html>
  )
}
