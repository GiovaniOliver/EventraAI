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
    } catch (error) {
      let errorMessage = "Unknown error message";
      let errorCode = "Unknown error code";
      if (error instanceof Error) {
        errorMessage = error.message;
        errorCode = (error as any).code || "Unknown error code";
      }
      console.error("Error fetching profile:", errorMessage, "Code:", errorCode, error);
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
    
    // Create a username from the email (ensure uniqueness with random suffix)
    const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 1000);
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
      console.log('[DEBUG] Error checking if user exists:', checkError || {});
      // Continue with insert attempt even if check fails
    }
    
    // First, check the table schema to see what columns exist
    console.log('[DEBUG] Checking users table schema before insert');
    try {
      const { data: schemaData, error: schemaError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
        
      if (schemaError) {
        console.error('[DEBUG] Error checking users table schema:', schemaError || {});
      } else if (schemaData && schemaData.length > 0) {
        console.log('[DEBUG] Users table columns:', Object.keys(schemaData[0]));
      }
    } catch (schemaCheckError) {
      console.error('[DEBUG] Schema check failed:', schemaCheckError || {});
    }

    // Create base user data
    const userData: any = {
      id: userId,
      email: email,
    };
    
    // Add fields conditionally to handle possible schema differences
    if (username) userData.username = username;
    if (displayName) userData.display_name = displayName;
    
    // Add optional fields if they exist in the schema
    userData.subscription_tier = 'free';
    userData.subscription_status = 'active';
    userData.is_admin = false;
    userData.role = 'user'; // For newer schema with role-based access
    
    console.log('[DEBUG] Attempting to insert user with data:', userData);
    
    const { error } = await supabase
      .from('users')
      .insert([userData])
      .select();
    
    if (error) {
      console.error('[DEBUG] Error creating user profile in users table:', error || {});
      
      if (error.code === '23505') { // Unique violation
        console.log('[DEBUG] Username collision detected, trying again with different username');
        
        // Try again with a different username if there was a collision
        userData.username = email.split('@')[0] + '_' + Math.floor(Math.random() * 10000);
        
        const { error: retryError } = await supabase
          .from('users')
          .insert([userData]);
          
        if (retryError) {
          console.error('[DEBUG] Failed on retry user insert:', retryError || {});
          return false;
        }
        
        console.log('[DEBUG] Successfully created user profile on retry');
        return true;
      }
      
      // If there was a column error, try with minimal data
      if (error.code === '42703') { // Undefined column
        console.log('[DEBUG] Column error detected, trying with minimal fields');
        
        const minimalUserData = {
          id: userId,
          email: email,
          username: username,
          display_name: displayName
        };
        
        const { error: minimalError } = await supabase
          .from('users')
          .insert([minimalUserData]);
          
        if (minimalError) {
          console.error('[DEBUG] Failed with minimal user data:', minimalError || {});
          return false;
        }
        
        console.log('[DEBUG] Successfully created user profile with minimal fields');
        return true;
      }
      
      return false;
    }
    
    console.log('[DEBUG] Successfully created user profile in users table');
    return true;
  } catch (error) {
    console.error('[DEBUG] Error in createUserProfile:', error || {});
    return false;
  }
}

export async function checkAndCreateUserProfile(): Promise<boolean> {
  try {
    console.log('[DEBUG] checkAndCreateUserProfile: Starting check');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[DEBUG] Error getting session:', sessionError || {});
      return false;
    }
    
    if (!session?.user) {
      console.log('[DEBUG] checkAndCreateUserProfile: No session found');
      return false;
    }
    
    console.log('[DEBUG] checkAndCreateUserProfile: Checking if profile exists for ID:', session.user.id);
    
    // Try a simple test query to check if the table exists
    try {
      // First check if the users table exists at all
      const { data: tableTest, error: tableError } = await supabase
        .from('users')
        .select('count(*)', { count: 'exact', head: true });
      
      if (tableError) {
        console.error('[DEBUG] Users table access error:', tableError || {});
        console.log('[DEBUG] Will attempt to create user profile anyway');
        
        // If there's a table issue, try directly creating the profile
        return await createUserProfile(
          session.user.id,
          session.user.email!,
          session.user.user_metadata?.full_name
        );
      }
    } catch (tableCheckError) {
      console.error('[DEBUG] Error checking users table:', tableCheckError || {});
      // Continue with normal flow
    }
    
    // Check if profile exists
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single();
    
      if (fetchError) {
        console.error('[DEBUG] Error checking user profile in users table:', fetchError || {});
      
        // Only create a profile if the error is that no row was found
        if (fetchError.code === 'PGRST116' || // "no rows returned"
            fetchError.message?.includes('no rows')) { 
          console.log('[DEBUG] Profile not found, creating new profile');
          
          // Try to get all available user data for debugging
          console.log('[DEBUG] User info:', {
            id: session.user.id,
            email: session.user.email
          });
          
          return await createUserProfile(
            session.user.id,
            session.user.email!,
            session.user.user_metadata?.full_name
          );
        }
        
        // For other errors, try creating the profile anyway as a fallback
        console.log('[DEBUG] Unknown error, attempting profile creation as fallback');
        return await createUserProfile(
          session.user.id,
          session.user.email!,
          session.user.user_metadata?.full_name
        );
      }
    
      console.log('[DEBUG] Profile found in users table:', existingProfile || {});
      return true;
    } catch (queryError) {
      console.error('[DEBUG] Unexpected error checking for existing profile:', queryError || {});
      
      // Try creating the profile anyway as a fallback
      console.log('[DEBUG] Attempting profile creation after query error');
      return await createUserProfile(
        session.user.id,
        session.user.email!,
        session.user.user_metadata?.full_name
      );
    }
  } catch (error) {
    console.error('[DEBUG] Error in checkAndCreateUserProfile:', error || {});
    return false;
  }
} 