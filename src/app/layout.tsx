import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EventraAI - Event Planning Made Simple',
  description: 'AI-powered event planning platform for seamless event management and collaboration',
  icons: {
    icon: '/images/eventraailogo1.png',
    shortcut: '/images/eventraailogo1.png',
    apple: '/images/eventraailogo1.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/eventraailogo1.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/eventraailogo1.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
