import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/shared/supabase-types'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  company_name: string | null
  job_title: string | null
  phone: string | null
  timezone: string | null
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

// Interface for the users table from the database
export interface DBUser {
  id: string
  username: string
  display_name: string
  email: string
  is_admin: boolean
  password?: string
  stripe_customer_id?: string
  subscription_tier: string
  subscription_status: string
  created_at: string
}

const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getUserProfile(): Promise<DBUser | null> {
  try {
    console.log('[DEBUG] getUserProfile: Getting session');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('[DEBUG] Error getting session in getUserProfile:', {
        error: sessionError,
        stringified: JSON.stringify(sessionError),
        message: sessionError?.message,
        stack: sessionError instanceof Error ? sessionError.stack : undefined
      });
      return null;
    }
    
    if (!session?.user) {
      console.log('[DEBUG] getUserProfile: No session found');
      return null;
    }
    
    console.log('[DEBUG] getUserProfile: Fetching user from users table for ID:', session.user.id);
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('[DEBUG] Error fetching user profile from users table:', {
          error: error,
          stringified: JSON.stringify(error),
          code: error?.code,
          message: error?.message,
          details: error?.details,
          hint: error?.hint
        });
        
        // If profile doesn't exist, try creating it
        if (error.code === 'PGRST116') { // No rows returned
          console.log('[DEBUG] Profile not found in getUserProfile, attempting to create it');
          const created = await createUserProfile(
            session.user.id,
            session.user.email!,
            session.user.user_metadata?.full_name
          );
          
          if (created) {
            // Try fetching the newly created profile
            console.log('[DEBUG] Fetching newly created profile');
            const { data: newProfile, error: newError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (!newError && newProfile) {
              return newProfile;
            }
          }
        }
        
        return null;
      }
      
      return profile;
    } catch (queryError) {
      console.error('[DEBUG] Unexpected error in getUserProfile query:', {
        error: queryError,
        stringified: JSON.stringify(queryError),
        stack: queryError instanceof Error ? queryError.stack : undefined
      });
      return null;
    }
  } catch (error) {
    console.error('[DEBUG] Error in getUserProfile:', {
      error: error,
      stringified: JSON.stringify(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
}

export async function updateUserProfile(updates: Partial<DBUser>): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return false
    }
    
    console.log('[DEBUG] updateUserProfile: Updating user in users table');
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', session.user.id)
    
    if (error) {
      console.error('[DEBUG] Error updating user profile in users table:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('[DEBUG] Error in updateUserProfile:', error)
    return false
  }
}

export async function createUserProfile(userId: string, email: string, fullName?: string): Promise<boolean> {
  try {
    console.log('[DEBUG] createUserProfile: Creating user in users table with ID:', userId);
    
    // Create a username from the email
    const username = email.split('@')[0];
    const displayName = fullName || username;
    
    // Check if the user already exists to prevent duplicate key errors
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (!checkError && existingUser) {
        console.log('[DEBUG] User already exists in database, skipping insert');
        return true;
      }
    } catch (checkError) {
      console.log('[DEBUG] Error checking if user exists:', JSON.stringify(checkError));
      // Continue with insert attempt even if check fails
    }
    
    const userData = {
      id: userId,
      username: username,
      display_name: displayName,
      email: email,
      is_admin: false,
      subscription_tier: 'free',
      subscription_status: 'active'
    };
    
    console.log('[DEBUG] Attempting to insert user with data:', JSON.stringify(userData));
    
    const { error } = await supabase
      .from('users')
      .insert(userData);
    
    if (error) {
      console.error('[DEBUG] Error creating user profile in users table:', {
        error: error,
        stringified: JSON.stringify(error),
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint
      });
      return false;
    }
    
    console.log('[DEBUG] Successfully created user profile in users table');
    return true;
  } catch (error) {
    console.error('[DEBUG] Error in createUserProfile:', {
      error: error,
      stringified: JSON.stringify(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
}

export async function checkAndCreateUserProfile(): Promise<boolean> {
  try {
    console.log('[DEBUG] checkAndCreateUserProfile: Starting check');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('[DEBUG] Error getting session:', {
        error: sessionError,
        stringified: JSON.stringify(sessionError),
        message: sessionError?.message,
        stack: sessionError instanceof Error ? sessionError.stack : undefined
      });
      return false;
    }
    
    if (!session?.user) {
      console.log('[DEBUG] checkAndCreateUserProfile: No session found');
      return false
    }
    
    console.log('[DEBUG] checkAndCreateUserProfile: Checking if profile exists for ID:', session.user.id);
    console.log('[DEBUG] User metadata:', JSON.stringify(session.user.user_metadata));
    
    // Check if profile exists
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single()
    
      if (fetchError) {
        console.error('[DEBUG] Error checking user profile in users table:', {
          error: fetchError,
          stringified: JSON.stringify(fetchError),
          code: fetchError?.code,
          message: fetchError?.message,
          details: fetchError?.details,
          hint: fetchError?.hint
        });
      
        // Only create a profile if the error is that no row was found
        if (fetchError.code === 'PGRST116') { // PGRST116 is "no rows returned"
          console.log('[DEBUG] Profile not found, creating new profile');
          // Try to get all available user data for debugging
          console.log('[DEBUG] User data available:', {
            id: session.user.id,
            email: session.user.email,
            metadata: session.user.user_metadata,
            appMetadata: session.user.app_metadata,
            hasFull_name: session.user.user_metadata?.full_name !== undefined,
            identities: session.user.identities
          });
          
          return await createUserProfile(
            session.user.id,
            session.user.email!,
            session.user.user_metadata?.full_name
          )
        }
        return false
      }
    
      console.log('[DEBUG] Profile found in users table:', existingProfile);
      return true
    } catch (queryError) {
      console.error('[DEBUG] Unexpected error checking for existing profile:', {
        error: queryError,
        stringified: JSON.stringify(queryError),
        stack: queryError instanceof Error ? queryError.stack : undefined
      });
      return false;
    }
  } catch (error) {
    console.error('[DEBUG] Error in checkAndCreateUserProfile:', {
      error: error,
      stringified: JSON.stringify(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return false
  }
} 