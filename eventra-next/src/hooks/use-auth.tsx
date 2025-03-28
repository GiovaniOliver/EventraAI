'use client'

import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Import toast directly without the hook to avoid circular dependencies
import { toast } from "./use-toast";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username: string, displayName: string) => Promise<void>;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  username: string;
  displayName: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          setError(error);
          setUser(null);
        } else if (data?.session) {
          // Get user profile data
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (userError) {
            console.error("Error fetching user data:", userError);
            setError(userError);
            setUser(null);
          } else {
            setUser(userData as User);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Unexpected error during session check:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get user profile data when signed in
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (userError) {
            console.error("Error fetching user data:", userError);
            setError(userError);
            setUser(null);
          } else {
            setUser(userData as User);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (userError) {
          throw userError;
        }
        
        setUser(userData as User);
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        router.push('/dashboard');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string, displayName: string) => {
    setIsLoading(true);
    try {
      // Register with Supabase Auth
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
        throw error;
      }
      
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account",
      });
      
      // Note: User data will be created via database trigger
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast({
        title: "Registration failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      toast({
        title: "Logout successful",
        description: "You have been logged out",
      });
      router.push('/login');
    } catch (err) {
      console.error("Logout error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast({
        title: "Logout failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 