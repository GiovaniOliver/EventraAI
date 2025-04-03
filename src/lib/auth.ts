import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/shared/supabase-types'

/**
 * Supabase Authentication Utilities
 * 
 * This module provides a set of helper functions for interacting with Supabase Auth,
 * simplifying common authentication operations like sign-in, sign-up, sign-out,
 * and password management.
 * 
 * Note: Many of these functions are also available through the useAuth hook,
 * which is the recommended way to handle authentication in components.
 */

const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Signs in a user with email and password
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error signing in:', error)
    return { data: null, error }
  }
}

/**
 * Registers a new user with email, password and optional full name
 */
export async function signUp(email: string, password: string, fullName?: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error signing up:', error)
    return { data: null, error }
  }
}

/**
 * Signs out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    return { error: null }
  } catch (error) {
    console.error('Error signing out:', error)
    return { error }
  }
}

/**
 * Sends a password reset email to the specified email address
 */
export async function resetPassword(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error resetting password:', error)
    return { data: null, error }
  }
}

/**
 * Updates the current user's password
 */
export async function updatePassword(newPassword: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error updating password:', error)
    return { data: null, error }
  }
}

/**
 * Gets the current session
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      throw error
    }
    return { session, error: null }
  } catch (error) {
    console.error('Error getting session:', error)
    return { session: null, error }
  }
}

/**
 * Gets the current user
 */
export async function getUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      throw error
    }
    return { user, error: null }
  } catch (error) {
    console.error('Error getting user:', error)
    return { user: null, error }
  }
}
