import './globals.css'
import '../styles/enhanced-ui.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EventraAI - Event Planning Made Simple',
  description: 'AI-powered event planning platform for seamless event management and collaboration',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/images/eventraailogo1.png',
  },
  // Add CSP metadata in addition to the CSP headers in next.config.js
  other: {
    'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.stripe.com https://js.stripe.com https://js.intercomcdn.com https://app.intercom.io https://widget.intercom.io https://cdn.jsdelivr.net https://cdn.auth0.com https://unpkg.com https://polyfill.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.stripe.com https://api.openai.com https://*.intercom.io wss://*.intercom.io https://*.algolia.net https://*.algolia.io localhost:*; worker-src 'self' blob:; frame-src 'self' https://*.stripe.com https://*.duosecurity.com https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com https://auth.magic.link",
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'x-xss-protection': '1; mode=block'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* favicon is defined in metadata */}
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
