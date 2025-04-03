import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthUser } from '@/lib/auth-middleware';

/**
 * Health check endpoint to verify authentication
 * This endpoint can be used to test if authentication is working properly
 */
export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
  console.log('[API] Auth health check accessed by user:', user.id);
  
  // Return basic user info to confirm authentication works
  return NextResponse.json({
    message: 'Authentication successful',
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      subscription_tier: user.subscription_tier || 'free'
    }
  });
});
