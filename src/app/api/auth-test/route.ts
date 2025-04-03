import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get auth token from header
  const authHeader = request.headers.get('Authorization');
  const cookies = request.headers.get('cookie') || '';
  
  return NextResponse.json({
    message: 'Auth debug info',
    hasAuthHeader: !!authHeader,
    authHeaderPrefix: authHeader ? authHeader.substring(0, 20) + '...' : 'none',
    cookies: cookies,
  });
} 