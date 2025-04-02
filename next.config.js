/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.stripe.com https://js.stripe.com https://js.intercomcdn.com https://app.intercom.io https://widget.intercom.io https://cdn.jsdelivr.net https://cdn.auth0.com https://unpkg.com https://polyfill.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.stripe.com https://api.openai.com https://*.intercom.io wss://*.intercom.io https://*.algolia.net https://*.algolia.io localhost:*; worker-src 'self' blob:; frame-src 'self' https://*.stripe.com https://*.duosecurity.com https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com https://auth.magic.link"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  },
  /* config options from next.config.ts can be added here */
}

module.exports = nextConfig