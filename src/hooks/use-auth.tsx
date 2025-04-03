'use client'

import { useContext } from "react";
import { useRouter } from 'next/navigation';
import { AuthContext } from "@/app/providers";
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { User } from '@/lib/supabase'; // Import the User type from supabase
import { AuthError } from '@supabase/supabase-js'; // Import AuthError type

// Import toast directly without the hook to avoid circular dependencies
import { toast } from "./use-toast";

/**
 * Supabase Authentication Hook
 * 
 * This is the primary authentication hook for the application.
 * It provides a unified interface to handle all authentication operations
 * using Supabase Auth, including login, logout, registration, and session management.
 */

// Initialize Supabase client
const supabase = createBrowserSupabaseClient();

/**
 * Supabase Authentication Hook
 * 
 * This is the primary authentication hook for the application.
 * It provides a unified interface to handle all authentication operations
 * using Supabase Auth, including login, logout, registration, and session management.
 */

// Define the return type of useAuth hook
export interface UseAuthReturn {
  user: User | null;
  refreshAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username: string, displayName: string) => Promise<any>;
  isLoading: boolean;
  error: Error | null;
  
  // Additional methods from the simple useAuth implementation
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (newPassword: string) => Promise<any>;
  getSession: () => Promise<any>;
  getUser: () => Promise<any>;
}

// Define the AuthContext type to match the context in providers.tsx
interface AuthContextType {
  isLoading: boolean;
  user: User | null;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Primary authentication hook that provides auth state and methods
 * to interact with Supabase Auth.
 */
export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext) as AuthContextType;
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
      
      // Check current Supabase session status
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
          ...(error as AuthError).status ? { status: (error as AuthError).status } : {}
        });
        
        throw error;
      }
      
      console.log('[DEBUG] Login successful, user:', data.user?.id);
      
      // Create a basic user profile in case the database query fails
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
          // Safe access with type checking
          if (userProfile && typeof userProfile === 'object' && 'email' in userProfile && 'is_admin' in userProfile) {
            console.log('[DEBUG] Admin check - found user profile:', userProfile.email, 'is_admin:', userProfile.is_admin);
          }
        }
      } catch (e) {
        console.error('[DEBUG] Failed to get user profile for admin check:', e);
      }
      
      // Use profile data for admin check, or fall back to context
      const isAdmin = 
        (userProfile && typeof userProfile === 'object' && 'is_admin' in userProfile && userProfile.is_admin) || 
        (context.user && context.user.is_admin) || 
        false;

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
      // Type assertion to ensure TypeScript knows these methods exist
      const { data, error } = await (supabase.auth as any).signUp({ 
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
          
          // Type assertion for insert method
          const { error: insertError } = await (supabase
            .from('users') as any)
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

  // Additional methods from the simple useAuth implementation
  const resetPassword = async (email: string) => {
    try {
      // Type assertion to ensure TypeScript knows these methods exist
      const { data, error } = await (supabase.auth as any).resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for password reset instructions",
      });
      
      return data;
    } catch (error) {
      console.error("Error resetting password:", error);
      
      toast({
        title: "Password reset failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      // Type assertion to ensure TypeScript knows these methods exist
      const { data, error } = await (supabase.auth as any).updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      });
      
      return data;
    } catch (error) {
      console.error("Error updating password:", error);
      
      toast({
        title: "Password update failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const getSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  };

  const getUser = async () => {
    try {
      // Type assertion to ensure TypeScript knows these methods exist
      const { data: { user }, error } = await (supabase.auth as any).getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  };

  return {
    user,
    refreshAuth,
    login,
    logout,
    register,
    resetPassword,
    updatePassword,
    getSession,
    getUser,
    isLoading: context.isLoading,
    error: context.error,
  };
}