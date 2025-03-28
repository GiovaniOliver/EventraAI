'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, ReactNode, createContext, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { User } from '@/lib/supabase'
import { ToastProvider } from '@/components/ui/toast'

// Auth context type
type AuthContextType = {
  isLoading: boolean
  user: User | null
  error: Error | null
}

// Create AuthContext
export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  user: null,
  error: null,
})

export function Providers({ children }: { children: ReactNode }) {
  // Create a client
  const [queryClient] = useState(() => new QueryClient())
  const [supabase] = useState(() => createBrowserSupabaseClient())

  // Initial auth state
  const [authState, setAuthState] = useState<AuthContextType>({
    isLoading: true,
    user: null,
    error: null,
  })

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
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
        
        setAuthState({
          user: userProfile,
          isLoading: false,
          error: null,
        })
        
        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event: string, session: any) => {
            if (!session) {
              setAuthState({
                user: null,
                isLoading: false,
                error: null,
              })
              return
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
            
            setAuthState({
              user: userProfile,
              isLoading: false,
              error: null,
            })
          }
        )
        
        return () => {
          authListener.subscription.unsubscribe()
        }
      } catch (error) {
        setAuthState({
          user: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Authentication error'),
        })
      }
    }
    
    checkUser()
  }, [supabase])

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