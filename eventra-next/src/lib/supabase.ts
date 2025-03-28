import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Dummy client for development when no real credentials are provided
const createDummyClient = () => {
  console.warn('Using dummy Supabase client. Authentication features will not work.')
  // Return a mock client with basic functionality
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          maybeSingle: async () => ({ data: null, error: null }),
        }),
        order: () => ({
          limit: () => ({
            range: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    }),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: new Error('Authentication disabled in development mode') }),
      signOut: async () => ({ error: null }),
    },
  };
};

// This client is used on the server
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials')
  }

  // If using example credentials in development, return dummy client
  if (supabaseUrl === 'https://example.supabase.co') {
    return createDummyClient() as any;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

// This client is used on the client-side
export const createBrowserSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials')
  }

  // If using example credentials in development, return dummy client
  if (supabaseUrl === 'https://example.supabase.co') {
    return createDummyClient() as any;
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

// Types based on the original application's schema
export type User = {
  id: string
  username: string
  password: string
  display_name: string
  email: string
  is_admin: boolean
  stripe_customer_id?: string
  subscription_tier: string
  subscription_status: string
  created_at: string
}

export type Event = {
  id: string
  title: string
  type: string
  format: string
  date: string
  owner_id: string
  estimated_guests?: number
  description?: string
  status: string
  theme?: string
  budget?: number
  location?: string
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  event_id: string
  title: string
  description?: string
  status: string
  due_date?: string
  assigned_to?: string
  created_at: string
  updated_at: string
} 