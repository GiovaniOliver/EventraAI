import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from './supabase';
import { createClient } from '@supabase/supabase-js';

export type AuthUser = {
  id: string;
  email: string;
  is_admin?: boolean;
  subscription_tier?: string;
  subscription_status?: string;
};

/**
 * Middleware to check if the user is authenticated
 * @param handler The API route handler function
 * @returns A wrapped handler function that includes authentication checks
 */
export function withAuth(
  handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Create Supabase client with request cookies
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      // Extract cookies from request headers
      const cookieHeader = req.headers.get('cookie');
      
      // Check for token in Authorization header first
      const authHeader = req.headers.get('Authorization');
      let token = null;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('[DEBUG] Found Bearer token in Authorization header:', token.substring(0, 10) + '...');
      } else {
        console.log('[DEBUG] No Authorization header found, checking cookies');
      }
      
      // Create client with the cookie header and/or Authorization token
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            ...(cookieHeader ? { cookie: cookieHeader } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      });
      
      // Get session directly from the token if available
      let session = null;
      if (token) {
        try {
          // First try using the token directly
          const { data, error } = await supabase.auth.getUser(token);
          if (!error && data.user) {
            console.log('[DEBUG] Successfully authenticated with token in Authorization header');
            session = { user: data.user };
          } else {
            console.error('[DEBUG] Error authenticating with token:', error);
          }
        } catch (tokenError) {
          console.error('[DEBUG] Failed to use token directly:', tokenError);
        }
      }
      
      // If token-based authentication failed, try getting the session
      if (!session) {
        const { data: sessionData, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error('[DEBUG] Auth session error:', authError);
        }
        
        session = sessionData.session;
      }
      
      // If no session found, return 401
      if (!session) {
        console.error('[DEBUG] No valid session found - authentication required');
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      console.log('[DEBUG] Successfully authenticated user:', session.user.id);
      
      // Get user profile from the database to include roles and subscription info
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('is_admin, subscription_tier, subscription_status')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('[DEBUG] Error fetching user profile in auth middleware:', profileError);
        // Continue with limited user info
      }
      
      // Combine auth user with profile data
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        ...userProfile
      };
      
      // Call the handler with the authenticated user
      return handler(req, user);
    } catch (error) {
      console.error('[DEBUG] Authentication middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware to check if the user is an admin
 * @param handler The API route handler function
 * @returns A wrapped handler function that includes admin authentication checks
 */
export function withAdminAuth(
  handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Create Supabase client with request cookies
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      // Check for token in Authorization header first
      const authHeader = req.headers.get('Authorization');
      const cookieHeader = req.headers.get('cookie');
      let token = null;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('[DEBUG] Found Bearer token in admin auth middleware');
      }
      
      // Create client with the cookie header and/or Authorization token
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            ...(cookieHeader ? { cookie: cookieHeader } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      });
      
      // Get session directly from the token if available
      let session = null;
      if (token) {
        try {
          // First try using the token directly
          const { data, error } = await supabase.auth.getUser(token);
          if (!error && data.user) {
            console.log('[DEBUG] Successfully authenticated admin with token');
            session = { user: data.user };
          } else {
            console.error('[DEBUG] Error authenticating admin with token:', error);
          }
        } catch (tokenError) {
          console.error('[DEBUG] Failed to use token directly for admin:', tokenError);
        }
      }
      
      // If token-based authentication failed, try getting the session
      if (!session) {
        const { data: sessionData, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error('[DEBUG] Admin auth session error:', authError);
        }
        
        session = sessionData.session;
      }
      
      // If no session found, return 401
      if (!session) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Get user profile to check admin status
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('is_admin, subscription_tier, subscription_status')
        .eq('id', session.user.id)
        .single();
      
      if (profileError || !userProfile) {
        console.error('Error fetching user profile in admin auth middleware:', profileError);
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        );
      }
      
      // Check if user is an admin
      if (!userProfile.is_admin) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
      
      // Combine auth user with profile data
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        ...userProfile
      };
      
      // Call the handler with the authenticated admin user
      return handler(req, user);
    } catch (error) {
      console.error('Admin authentication middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware to check if a user has permission to access an event
 * @param eventId ID of the event to check permissions for
 * @param userId ID of the user
 * @returns Boolean indicating if the user has access
 */
export async function hasEventPermission(eventId: string, userId: string): Promise<boolean> {
  try {
    // Create Supabase client directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Create a direct client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    
    // Check if user is the owner of the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('owner_id')
      .eq('id', eventId)
      .single();
    
    if (event && event.owner_id === userId) {
      return true;
    }
    
    // Check if user is a team member for the event
    const { data: teamMember, error: teamError } = await supabase
      .from('event_team')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (teamMember) {
      return true;
    }
    
    // Check if user is an admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();
    
    if (user && user.is_admin) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking event permission:', error);
    return false;
  }
}

/**
 * Middleware to check if a user has subscription access to a feature
 * @param featureType Type of feature to check access for
 * @param user Authenticated user object
 * @returns Boolean indicating if the user has access
 */
export async function hasSubscriptionAccess(
  featureType: 'ai' | 'events' | 'guests' | 'team' | 'analytics',
  user: AuthUser
): Promise<boolean> {
  // Admin users always have access to all features
  if (user.is_admin) {
    return true;
  }
  
  // If subscription isn't active, access is denied
  if (user.subscription_status !== 'active') {
    return false;
  }
  
  // Feature access by subscription tier
  const tierAccess: Record<string, string[]> = {
    free: ['events'],
    starter: ['events', 'ai', 'guests'],
    pro: ['events', 'ai', 'guests', 'team'],
    business: ['events', 'ai', 'guests', 'team', 'analytics'],
    enterprise: ['events', 'ai', 'guests', 'team', 'analytics']
  };
  
  const tier = user.subscription_tier || 'free';
  const allowedFeatures = tierAccess[tier] || [];
  
  return allowedFeatures.includes(featureType);
}