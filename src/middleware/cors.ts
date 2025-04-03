import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if this is a Supabase request
  const isSupabaseRequest = request.nextUrl.pathname.startsWith('/supabase') ||
                            request.nextUrl.pathname.startsWith('/auth') ||
                            request.nextUrl.pathname.startsWith('/rest') ||
                            request.nextUrl.pathname.startsWith('/storage');
  
  // Only apply CORS headers to Supabase requests
  if (isSupabaseRequest) {
    console.log('CORS middleware: Applying CORS headers to Supabase request:', request.nextUrl.pathname);
    
    // For OPTIONS requests (preflight)
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      
      applyCorsPolicies(response.headers);
      
      return response;
    }
    
    // For all other requests
    const response = NextResponse.next();
    
    applyCorsPolicies(response.headers);
    
    return response;
  }
  
  // For non-Supabase requests, just continue
  return NextResponse.next();
}

function applyCorsPolicies(headers: Headers) {
  // Set permissive CORS headers for local development
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Client-Info, Authorization, Range, apikey');
  headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
}

export const config = {
  matcher: [
    '/supabase/:path*',
    '/rest/:path*',
    '/auth/:path*',
    '/storage/:path*',
  ],
};