'use client'

import { useContext } from "react";
import { useRouter } from 'next/navigation';
import { AuthContext } from "@/app/providers";
import { createBrowserSupabaseClient } from '@/lib/supabase';

// Import toast directly without the hook to avoid circular dependencies
import { toast } from "./use-toast";

// Initialize Supabase client - use the one from lib/supabase.ts to ensure consistent configuration
const supabase = createBrowserSupabaseClient();

export type User = {
  id: string;
  username: string;
  email: string;
  display_name: string;
  is_admin: boolean;
  subscription_tier: string;
  subscription_status: string;
  created_at: string;
  displayName?: string; // Getter property
};

// Define the return type of useAuth hook
export interface UseAuthReturn {
  user: User | null;
  refreshAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username: string, displayName: string) => Promise<any>;
  isLoading: boolean;
  error: Error | null;
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  const router = useRouter();

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Add displayName getter for compatibility with original codebase
  const user = context.user ? {
    ...context.user,
    // Add displayName as a getter that returns display_name for backward compatibility
    get displayName(): string {
      return this.display_name;
    }
  } : null;

  // Add the refreshAuth function from context
  const refreshAuth = async () => {
    try {
      await context.refresh();
    } catch (error) {
      console.error("Error refreshing auth state:", error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('[DEBUG] Starting login attempt with email:', email); 
      console.log('[DEBUG] Supabase client status:', supabase ? 'initialized' : 'not initialized');
      console.log('[DEBUG] Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 10) + '...' // Show only beginning for security
      });
      
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        console.log('[DEBUG] Running in browser environment');
      }
      
      // Log current Supabase session status
      const sessionCheck = await supabase.auth.getSession();
      console.log('[DEBUG] Current session status before login:', 
        sessionCheck.data.session ? 'Has existing session' : 'No existing session');
      
      if (sessionCheck.error) {
        console.error('[DEBUG] Error checking session:', sessionCheck.error);
      }
      
      // Attempt to sign in with Supabase
      console.log('[DEBUG] Calling supabase.auth.signInWithPassword');
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      console.log('[DEBUG] Login attempt completed');
      
      if (error) {
        console.error('[DEBUG] Supabase auth error:', {
          name: error.name,
          message: error.message,
          status: error.status
        });
        
        // Log specific error handling for AuthApiError
        if (error.name === 'AuthApiError') {
          console.error('[DEBUG] AuthApiError details:', {
            status: error.status,
            message: error.message
          });
          
          // Check if it's an invalid credentials error
          if (error.message === 'Invalid login credentials') {
            console.log('[DEBUG] Invalid credentials detected - checking user existence');
            
            // Log that we can't check user existence due to Supabase limitations
            console.log('[DEBUG] Cannot verify if user exists - Supabase client-side restrictions');
          }
        }
        
        throw error;
      }
      
      console.log('[DEBUG] Login successful, user:', data.user?.id);
      
      // Create a basic user profile in case the database query fails
      // This allows the app to continue working even if the users table has issues
      const tempUserProfile = {
        id: data.user?.id || 'unknown',
        username: data.user?.email?.split('@')[0] || 'user',
        display_name: data.user?.user_metadata?.display_name || data.user?.email?.split('@')[0] || 'User',
        email: data.user?.email || '',
        is_admin: data.user?.email?.includes('admin') || false,
        password: '',
        subscription_tier: 'free',
        subscription_status: 'active',
        created_at: data.user?.created_at || new Date().toISOString()
      };
      
      // Manually update context with the user profile
      try {
        const refreshPromise = refreshAuth();
        
        // Set a timeout to prevent hanging on profile fetch
        const timeoutPromise = new Promise<void>((resolve) => {
          setTimeout(() => {
            console.log('[DEBUG] Profile fetch taking too long, proceeding with basic profile');
            resolve();
          }, 2000);
        });
        
        // Race between the refresh and the timeout
        await Promise.race([refreshPromise, timeoutPromise]);
      } catch (refreshError) {
        console.error('[DEBUG] Error refreshing auth state:', refreshError);
        // We'll continue despite this error
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Get redirect URL from query params, if any
      const params = new URLSearchParams(window.location.search);
      const redirectedFrom = params.get('redirectedFrom');
      
      // Get user profile data for admin check
      let userProfile = null;
      try {
        // Attempt to get the user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user?.id)
          .single();
          
        if (!profileError && profile) {
          userProfile = profile;
          console.log('[DEBUG] Admin check - found user profile:', userProfile.email, 'is_admin:', userProfile.is_admin);
        }
      } catch (e) {
        console.error('[DEBUG] Failed to get user profile for admin check:', e);
      }
      
      // Use profile data for admin check, or fall back to context
      const isAdmin = userProfile?.is_admin || context.user?.is_admin || false;
      console.log('[DEBUG] Final admin status determination:', isAdmin);
      
      let redirectTo = '/dashboard'; // Default redirect
      
      // If user is admin and not being redirected from a specific page, go to admin dashboard
      if (isAdmin && !redirectedFrom) {
        redirectTo = '/admin/dashboard';
        console.log('[DEBUG] Redirecting admin to admin dashboard');
      } else if (redirectedFrom) {
        redirectTo = redirectedFrom;
        console.log('[DEBUG] Redirecting to:', redirectedFrom);
      }
      
      router.push(redirectTo);
    } catch (err) {
      console.error("[DEBUG] Login error details:", {
        name: err instanceof Error ? err.name : 'Unknown error',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      
      // Special handling for fetch errors
      let errorMessage = "Login failed";
      if (err instanceof Error) {
        if (err.message.includes('fetch') || err.name === 'AuthRetryableFetchError' || err.message.includes('network')) {
          errorMessage = "Network connection error. Please check your internet connection and try again.";
        } else if (err.message.includes('invalid') || err.name === 'AuthApiError' && err.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please double-check your credentials and try again.";
          
          // Add admin account debugging help
          if (email.includes('admin')) {
            console.log('[DEBUG] Admin account login failed - special handling');
            errorMessage += " If you're trying to access the admin account, please verify it exists in your Supabase instance.";
          }
        } else if (err.message.includes('too many requests')) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else {
          errorMessage = `Login failed: ${err.message}`;
        }
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Attempt to sign out with Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Logout successful",
        description: "You have been logged out",
      });
      
      // Refresh auth state after logout
      await refreshAuth();
      
      router.push('/login');
    } catch (err) {
      console.error("Logout error:", err);
      toast({
        title: "Logout failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
      throw err;
    }
  };

  const register = async (email: string, password: string, username: string, displayName: string) => {
    try {
      console.log('[DEBUG] Attempting to register:', { email, username }); // Only log non-sensitive data
      
      // Attempt to register with Supabase
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username,
            display_name: displayName
          }
        }
      });
      
      if (error) {
        console.error('[DEBUG] Supabase registration error:', error);
        throw error;
      }
      
      console.log('[DEBUG] Registration successful:', data.user?.id);
      
      // Create user profile manually if trigger fails
      try {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user?.id)
          .single();
          
        if (profileError || !profile) {
          console.log('[DEBUG] Creating user profile manually');
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user?.id,
              email: email,
              username: username,
              display_name: displayName,
              password: 'MANAGED_BY_SUPABASE_AUTH',
              is_admin: false,
              subscription_tier: 'free',
              subscription_status: 'active',
              created_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('[DEBUG] Error creating user profile:', insertError);
          }
        }
      } catch (profileErr) {
        console.error('[DEBUG] Profile creation error:', profileErr);
      }
      
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account",
      });
      
      // Refresh auth state after registration
      await refreshAuth();
      
      router.push('/confirm');
    } catch (err) {
      console.error("Registration error:", err);
      
      let errorMessage = "Registration failed";
      if (err instanceof Error) {
        if (err.message.includes('fetch') || err.name === 'AuthRetryableFetchError' || err.message.includes('network')) {
          errorMessage = "Network connection error. Please check your internet connection and try again.";
        } else if (err.message.includes('email')) {
          errorMessage = "This email address is already in use or invalid. Please try another.";
        } else if (err.message.includes('password')) {
          errorMessage = "Password does not meet requirements. Please use a stronger password.";
        } else {
          errorMessage = `Registration failed: ${err.message}`;
        }
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    }
  };

  return {
    user,
    refreshAuth,
    login,
    logout,
    register,
    isLoading: context.isLoading,
    error: context.error,
  };
}