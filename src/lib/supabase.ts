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
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  };
};

// This client is used on the server
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Authentication will not work.')
    throw new Error('Missing Supabase credentials')
  }
  
  // Use a real Supabase client with the provided credentials
  try {
    console.log('Creating Supabase server client with URL:', supabaseUrl)
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    throw error
  }
}

// Custom fetch implementation with retry logic
const fetchWithRetry = async (url: RequestInfo | URL, options: RequestInit = {}) => {
  const MAX_RETRIES = 3;
  let error = null;
  
  // Don't add CORS headers as they can cause issues with cross-origin requests
  // Use the original options without modification
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`Fetch attempt ${i + 1} to ${typeof url === 'string' ? url : url.toString()}`);
      const response = await fetch(url, options);
      return response;
    } catch (e) {
      console.error(`Fetch attempt ${i + 1} failed:`, e);
      error = e;
      // Wait before retrying (exponential backoff)
      if (i < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }
  
  throw error;
};

// This client is used on the client-side
export const createBrowserSupabaseClient = () => {
  console.log('[DEBUG] Creating browser Supabase client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  // Check for proper environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[DEBUG] Missing Supabase env variables:', {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
  }
  
  try {
    // Create the client with debug info
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true,
          storageKey: 'eventra-auth',
          storage: {
            getItem: (key) => {
              try {
                const item = localStorage.getItem(key);
                console.log(`[DEBUG] Auth storage getItem: ${key} = ${item ? 'exists' : 'null'}`);
                return item;
              } catch (error) {
                console.error(`[DEBUG] Error getting item from storage: ${key}`, error);
                return null;
              }
            },
            setItem: (key, value) => {
              try {
                console.log(`[DEBUG] Auth storage setItem: ${key}`);
                localStorage.setItem(key, value);
              } catch (error) {
                console.error(`[DEBUG] Error setting item in storage: ${key}`, error);
              }
            },
            removeItem: (key) => {
              try {
                console.log(`[DEBUG] Auth storage removeItem: ${key}`);
                localStorage.removeItem(key);
              } catch (error) {
                console.error(`[DEBUG] Error removing item from storage: ${key}`, error);
              }
            }
          },
          debug: true, // Enable auth debugging
        },
        global: {
          headers: {
            'X-Client-Info': 'EventraAI Next.js'
          },
        },
        cookieOptions: {
          name: 'eventra-auth',
          maxAge: 60 * 60 * 8, // 8 hours in seconds
          domain: typeof window !== 'undefined' ? window.location.hostname : undefined,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        }
      }
    );
  } catch (error) {
    console.error('[DEBUG] Error creating Supabase client:', error);
    throw error;
  }
};

// Import and use the types from the database-types.ts file
import { Database } from '@/shared/database-types'

// Re-export User type from the Database type
export type User = Database['public']['Tables']['users']['Row']

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

export type EventVendor = {
  id: string
  event_id: string
  vendor_id: string
  status: string
  created_at: string
  updated_at: string
}

export type Vendor = {
  id: string
  name: string
  category: string
  contact_info: string
  website?: string
  rating?: number
  price_range?: string
  description?: string
  created_at: string
  updated_at: string
} 