'use client'

import { useContext } from "react";
import { useRouter } from 'next/navigation';
import { AuthContext } from "@/app/providers";
import { createBrowserSupabaseClient } from '@/lib/supabase';

// Import toast directly without the hook to avoid circular dependencies
import { toast } from "./use-toast";

// Initialize Supabase client - use the one from lib/supabase.ts to ensure consistent configuration
const supabase = createBrowserSupabaseClient();

// Use development mode if enabled in environment
const isDevelopmentMode = process.env.NEXT_PUBLIC_ALLOW_DEV_MODE === 'true';

export type User = {
  id: string;
  username: string;
  email: string;
  display_name: string;
  is_admin: boolean;
  subscription_tier: string;
  subscription_status: string;
  created_at: string;
};

export function useAuth() {
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
      console.log('Attempting to login with:', { email }); // Only log email for security
      
      // If in development mode, simulate successful login
      if (isDevelopmentMode) {
        console.log('Development mode active: simulating successful login');
        
        // Simulate a delay for authentication
        await new Promise(resolve => setTimeout(resolve, 500));
        
        toast({
          title: "Development Login",
          description: "Logged in with development mode!",
        });
        
        // Refresh auth state to ensure latest user data
        await refreshAuth();
        
        router.push('/dashboard');
        return;
      }
      
      // Attempt to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Refresh auth state to ensure latest user data
      await refreshAuth();
      
      router.push('/dashboard');
    } catch (err) {
      console.error("Login error:", err);
      
      // Special handling for fetch errors
      let errorMessage = "Login failed";
      if (err instanceof Error) {
        if (err.message.includes('fetch') || err.name === 'AuthRetryableFetchError' || err.message.includes('network')) {
          errorMessage = "Network connection error. Please check your internet connection and try again.";
        } else if (err.message.includes('invalid')) {
          errorMessage = "Invalid email or password. Please try again.";
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
      // If in development mode, simulate successful logout
      if (isDevelopmentMode) {
        console.log('Development mode active: simulating successful logout');
        
        // Simulate a delay for logout
        await new Promise(resolve => setTimeout(resolve, 300));
        
        toast({
          title: "Development Logout",
          description: "Logged out in development mode",
        });
        
        // Refresh auth state after logout
        await refreshAuth();
        
        router.push('/login');
        return;
      }
      
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
      console.log('Attempting to register:', { email, username }); // Only log non-sensitive data
      
      // If in development mode, simulate successful registration
      if (isDevelopmentMode) {
        console.log('Development mode active: simulating successful registration');
        
        // Simulate a delay for registration
        await new Promise(resolve => setTimeout(resolve, 800));
        
        toast({
          title: "Development Registration",
          description: "Registered in development mode!",
        });
        
        // Refresh auth state after registration
        await refreshAuth();
        
        router.push('/confirm');
        return;
      }
      
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
        console.error('Supabase registration error:', error);
        throw error;
      }
      
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account",
      });
      
      // Note: User data will be created via database trigger
      
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
    isLoading: context.isLoading,
    error: context.error,
    login,
    logout,
    register,
    refreshAuth
  };
}