import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Saheli-AI — Cognitive Load Assistant',
  description: 'The intelligent assistant that manages birthdays, medicines, and school events for Indian families — so you can be present for the moments that matter.',
  keywords: 'Indian families, cognitive load, birthday reminders, medicine tracking, school events, AI assistant',
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
      </head>
      <body style={{ background: '#fdf8f5', minHeight: '100vh' }}>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#fdf8f5' }}>
          <Navigation />
          <main style={{ flex: 1, marginLeft: '240px', minHeight: '100vh', background: '#fdf8f5' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
