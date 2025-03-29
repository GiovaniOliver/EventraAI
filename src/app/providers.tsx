'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, ReactNode, createContext, useEffect, useRef } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { User } from '@/lib/supabase'
import { ToastProvider } from '@/components/ui/toast'
import { useToast } from '@/components/ui/toast'

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

// Mock user for development
const mockUser: User = {
  id: '123456',
  username: 'demo',
  email: 'demo@example.com',
  display_name: 'Demo User',
  is_admin: true,
  password: '',
  subscription_tier: 'pro',
  subscription_status: 'active',
  created_at: new Date().toISOString()
}

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

  // Use development mode if enabled in environment
  const isDevelopmentMode = process.env.NEXT_PUBLIC_ALLOW_DEV_MODE === 'true'

  // Function to check user authentication with retry logic
  const checkUser = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    
    try {
      console.log('Checking user authentication, attempt:', retryCount + 1);
      
      // In development mode, use mock user if enabled
      if (isDevelopmentMode) {
        console.log('Using mock user for development mode');
        
        const refreshAuth = async () => {
          console.log('Mock refresh called in development mode');
        };
        
        setAuthState({
          user: mockUser,
          isLoading: false,
          error: null,
          refresh: refreshAuth
        });
        
        return;
      }
      
      // Regular Supabase auth flow for production
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error);
        throw error;
      }
      
      let userProfile = null
      
      if (data.session?.user) {
        // Get user profile from the database
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single()
        
        if (!profileError && profile) {
          userProfile = profile
        } else {
          console.error('Error fetching user profile:', profileError)
          // Create a minimal user object if profile not found
          userProfile = {
            id: data.session.user.id,
            username: data.session.user.email?.split('@')[0] || 'user',
            display_name: data.session.user.user_metadata?.name || data.session.user.email || 'User',
            email: data.session.user.email || '',
            is_admin: false,
            password: '',
            subscription_tier: 'free',
            subscription_status: 'active',
            created_at: data.session.user.created_at || new Date().toISOString()
          }
        }
      }
      
      const refreshAuth = async () => {
        console.log('Manually refreshing authentication state');
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
          console.log('Auth state changed:', event);
          
          if (!session) {
            setAuthState(prev => ({
              ...prev,
              user: null,
              isLoading: false,
            }));
            return;
          }
          
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          let userProfile = null
          
          if (!profileError && profile) {
            userProfile = profile
          } else {
            console.error('Error fetching user profile in auth change:', profileError)
            // Create a minimal user profile
            userProfile = {
              id: session.user.id,
              username: session.user.email?.split('@')[0] || 'user',
              display_name: session.user.user_metadata?.name || session.user.email || 'User',
              email: session.user.email || '',
              is_admin: false,
              password: '',
              subscription_tier: 'free',
              subscription_status: 'active',
              created_at: session.user.created_at || new Date().toISOString()
            }
          }
          
          setAuthState(prev => ({
            ...prev,
            user: userProfile,
            isLoading: false,
          }));
        }
      )
      
      authListenerRef.current = authListener;
    } catch (error) {
      console.error('Authentication error:', error);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying authentication in ${Math.pow(2, retryCount)} seconds...`);
        setTimeout(() => checkUser(retryCount + 1), 1000 * Math.pow(2, retryCount));
        return;
      }
      
      // If we're in development mode and all retries failed, fall back to mock user
      if (isDevelopmentMode) {
        console.log('All authentication retries failed in development mode, using mock user');
        setAuthState({
          user: mockUser,
          isLoading: false,
          error: null,
          refresh: async () => {
            console.log('Mock refresh called after auth failure');
          }
        });
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