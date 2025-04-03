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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.stripe.com https://js.stripe.com https://js.intercomcdn.com https://app.intercom.io https://widget.intercom.io https://cdn.jsdelivr.net https://cdn.auth0.com https://unpkg.com https://polyfill.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' http://127.0.0.1:* http://localhost:* https://*.supabase.co wss://*.supabase.co https://*.stripe.com https://api.openai.com https://*.intercom.io wss://*.intercom.io https://*.algolia.net https://*.algolia.io localhost:*; worker-src 'self' blob:; frame-src 'self' https://*.stripe.com https://*.duosecurity.com https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com https://auth.magic.link"
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
      },
      {
        // Add specific CORS headers for Supabase auth endpoints
        source: '/auth/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Client-Info, Authorization' },
        ]
      },
      {
        // Add specific CORS headers for Supabase API endpoints
        source: '/rest/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Client-Info, Authorization' },
        ]
      }
    ]
  },
  // Add rewrites to proxy Supabase requests when in development
  async rewrites() {
    return process.env.NODE_ENV === 'development' 
      ? [
          {
            source: '/auth/:path*',
            destination: 'http://127.0.0.1:54321/auth/:path*',
          },
          {
            source: '/rest/:path*',
            destination: 'http://127.0.0.1:54321/rest/:path*',
          },
        ]
      : [];
  },
  /* config options from next.config.ts can be added here */
}

module.exports = nextConfig