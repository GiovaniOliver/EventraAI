import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Action types
type Action = 'create' | 'read' | 'update' | 'delete';

// Resource types
type Resource = 'events' | 'tasks' | 'guests' | 'files' | 'vendors' | 'ai_suggestions' | 'venue_visualizations';

// Role hierarchy from lowest to highest privileges
export const roleHierarchy = ['user', 'viewer', 'editor', 'admin'];

// Permission matrix defining what each role can do
const permissionMatrix: Record<string, Record<Resource, Action[]>> = {
  user: {
    events: ['read'],
    tasks: ['read'],
    guests: ['read'],
    files: ['read'],
    vendors: ['read'],
    ai_suggestions: ['read'],
    venue_visualizations: ['read'],
  },
  viewer: {
    events: ['read'],
    tasks: ['read'],
    guests: ['read'],
    files: ['read'],
    vendors: ['read'],
    ai_suggestions: ['read'],
    venue_visualizations: ['read'],
  },
  editor: {
    events: ['read', 'update'],
    tasks: ['read', 'create', 'update', 'delete'],
    guests: ['read', 'create', 'update', 'delete'],
    files: ['read', 'create', 'update', 'delete'],
    vendors: ['read', 'create', 'update', 'delete'],
    ai_suggestions: ['read', 'create', 'update', 'delete'],
    venue_visualizations: ['read', 'create', 'update', 'delete'],
  },
  admin: {
    events: ['read', 'create', 'update', 'delete'],
    tasks: ['read', 'create', 'update', 'delete'],
    guests: ['read', 'create', 'update', 'delete'],
    files: ['read', 'create', 'update', 'delete'],
    vendors: ['read', 'create', 'update', 'delete'],
    ai_suggestions: ['read', 'create', 'update', 'delete'],
    venue_visualizations: ['read', 'create', 'update', 'delete'],
  },
};

/**
 * Check if a user has permission to perform an action on a resource
 */
export async function hasPermission(userId: string, action: Action, resource: Resource): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    // Get user role
    const { data: user, error } = await supabase
      .from('users')
      .select('is_admin, subscription_tier')
      .eq('id', userId)
      .single();
    
    if (error || !user) {
      console.error('Error getting user role:', error);
      return false;
    }
    
    // Admin users have all permissions
    if (user.is_admin) {
      return true;
    }
    
    // Default role is 'user'
    let role = 'user';
    
    // Map subscription tier to role
    if (user.subscription_tier === 'business' || user.subscription_tier === 'enterprise') {
      role = 'admin';
    } else if (user.subscription_tier === 'pro') {
      role = 'editor';
    } else if (user.subscription_tier === 'starter') {
      role = 'viewer';
    }
    
    // Check if the role has permission for the action on the resource
    const allowedActions = permissionMatrix[role][resource] || [];
    return allowedActions.includes(action);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if a user is the owner of an event
 */
export async function isEventOwner(userId: string, eventId: string): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    const { data, error } = await supabase
      .from('events')
      .select('user_id')
      .eq('id', eventId)
      .eq('user_id', userId)
      .single();
    
    return !error && !!data;
  } catch (error) {
    console.error('Error checking event ownership:', error);
    return false;
  }
}

/**
 * Check if a user is a team member of an event
 */
export async function isEventTeamMember(userId: string, eventId: string): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    const { data, error } = await supabase
      .from('event_team_members')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();
    
    return !error && !!data;
  } catch (error) {
    console.error('Error checking team membership:', error);
    return false;
  }
}

/**
 * Get team member role for an event
 */
export async function getTeamMemberRole(userId: string, eventId: string): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    const { data, error } = await supabase
      .from('event_team_members')
      .select('role')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data.role;
  } catch (error) {
    console.error('Error getting team member role:', error);
    return null;
  }
} 