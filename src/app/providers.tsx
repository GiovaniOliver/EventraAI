'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, ReactNode, createContext, useEffect, useRef } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { User } from '@/lib/supabase'
import { ToastProvider } from '@/components/ui/toast'

// Auth context type
type AuthContextType = {
  isLoading: boolean
  user: User | null
  error: Error | null
  refresh: () => Promise<void>
}

// Create AuthContext
export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  user: null,
  error: null,
  refresh: async () => {}
})

export function Providers({ children }: { children: ReactNode }) {
  // Create a client
  const [queryClient] = useState(() => new QueryClient())
  const [supabase] = useState(() => createBrowserSupabaseClient())
  const authListenerRef = useRef<{ subscription: { unsubscribe: () => void } } | null>(null)

  // Initial auth state
  const [authState, setAuthState] = useState<AuthContextType>({
    isLoading: true,
    user: null,
    error: null,
    refresh: async () => {}
  })

  // Create a user profile from session data when DB query fails
  const createUserProfileFromSession = (sessionUser: any) => {
    console.log('[DEBUG] Creating fallback user profile from session data');
    
    // Log available fields in user metadata to help debug
    console.log('[DEBUG] Session user metadata:', sessionUser.user_metadata);
    console.log('[DEBUG] Session user data fields:', Object.keys(sessionUser));
    
    return {
      id: sessionUser.id,
      username: sessionUser.email?.split('@')[0] || 'user',
      display_name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'User',
      email: sessionUser.email || '',
      is_admin: sessionUser.email?.includes('admin') || false, // Temporary admin check
      password: '',
      subscription_tier: 'free',
      subscription_status: 'active',
      created_at: sessionUser.created_at || new Date().toISOString()
    };
  };

  // Function to check user authentication with retry logic
  const checkUser = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    
    try {
      console.log('[DEBUG] Checking user authentication, attempt:', retryCount + 1);
      
      // Regular Supabase auth flow
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('[DEBUG] Error getting session:', error);
        throw error;
      }
      
      console.log('[DEBUG] Session data received:', data.session ? 'Session exists' : 'No session');
      
      let userProfile = null
      
      if (data.session?.user) {
        console.log('[DEBUG] User authenticated, fetching profile for ID:', data.session.user.id);
        
        try {
          // Get user profile from the database
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single()
          
          console.log('[DEBUG] Profile query result:', profile ? 'Profile found' : 'No profile found');
          
          if (profileError) {
            console.error('[DEBUG] Profile fetch error details:', {
              code: profileError.code,
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint
            });
            
            // Try to get database schema to debug
            try {
              console.log('[DEBUG] Attempting to check users table schema');
              const { data: schemaData, error: schemaError } = await supabase
                .from('users')
                .select('*')
                .limit(1);
                
              if (schemaError) {
                console.error('[DEBUG] Table schema check error:', schemaError);
              } else {
                console.log('[DEBUG] Users table exists with structure:', 
                  schemaData && schemaData.length > 0 ? Object.keys(schemaData[0]) : 'No rows found');
              }
            } catch (schemaCheckError) {
              console.error('[DEBUG] Schema check failed:', schemaCheckError);
            }
          }
          
          if (!profileError && profile) {
            userProfile = profile;
            console.log('[DEBUG] User profile loaded successfully');
          } else {
            // Create a minimal user object if profile not found
            console.warn('[DEBUG] User profile not found in database, creating from session');
            userProfile = createUserProfileFromSession(data.session.user);
            
            // Attempt to insert the user into the database
            try {
              console.log('[DEBUG] Attempting to insert user into database');
              const { error: insertError } = await supabase
                .from('users')
                .insert([userProfile]);
                
              if (insertError) {
                console.error('[DEBUG] Error inserting user profile:', insertError);
              } else {
                console.log('[DEBUG] User profile inserted successfully');
              }
            } catch (insertError) {
              console.error('[DEBUG] Failed to insert user profile:', insertError);
            }
          }
        } catch (profileQueryError) {
          console.error('[DEBUG] Critical error during profile query:', profileQueryError);
          userProfile = createUserProfileFromSession(data.session.user);
        }
      }
      
      const refreshAuth = async () => {
        console.log('[DEBUG] Manually refreshing authentication state');
        if (authListenerRef.current) {
          authListenerRef.current.subscription.unsubscribe();
        }
        await checkUser();
      };

      setAuthState({
        user: userProfile,
        isLoading: false,
        error: null,
        refresh: refreshAuth
      })
      
      // Listen for auth changes
      if (authListenerRef.current) {
        authListenerRef.current.subscription.unsubscribe();
      }
      
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          console.log('[DEBUG] Auth state changed:', event);
          
          if (!session) {
            console.log('[DEBUG] Session ended, clearing user');
            setAuthState(prev => ({
              ...prev,
              user: null,
              isLoading: false,
            }));
            return;
          }
          
          console.log('[DEBUG] Session active, getting profile');
          
          try {
            // Get user profile
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            console.log('[DEBUG] Profile fetch result:', profile ? 'Profile found' : 'No profile');
            
            let userProfile = null
            
            if (!profileError && profile) {
              userProfile = profile;
              console.log('[DEBUG] Using database profile');
            } else {
              console.error('[DEBUG] Error fetching user profile in auth change:', 
                profileError ? {
                  code: profileError.code,
                  message: profileError.message
                } : 'Unknown error');
                
              // Create a fallback profile from session data
              userProfile = createUserProfileFromSession(session.user);
              console.log('[DEBUG] Created fallback profile');
            }
            
            setAuthState(prev => ({
              ...prev,
              user: userProfile,
              isLoading: false,
            }));
          } catch (profileError) {
            console.error('[DEBUG] Critical error in auth change handler:', profileError);
            // Even on error, create a minimal profile to prevent app from breaking
            const fallbackProfile = createUserProfileFromSession(session.user);
            
            setAuthState(prev => ({
              ...prev,
              user: fallbackProfile,
              isLoading: false,
              error: profileError instanceof Error ? profileError : new Error('Profile fetch failed')
            }));
          }
        }
      )
      
      authListenerRef.current = authListener;
    } catch (error) {
      console.error('[DEBUG] Authentication error:', error);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`[DEBUG] Retrying authentication in ${Math.pow(2, retryCount)} seconds...`);
        setTimeout(() => checkUser(retryCount + 1), 1000 * Math.pow(2, retryCount));
        return;
      }
      
      setAuthState(prev => ({
        ...prev,
        user: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Authentication error'),
      }));
    }
  }

  useEffect(() => {
    // Initialize auth state
    checkUser();
    
    return () => {
      // Cleanup auth listener on unmount
      if (authListenerRef.current) {
        console.log('Cleaning up auth listener');
        authListenerRef.current.subscription.unsubscribe();
      }
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authState}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  )
} 