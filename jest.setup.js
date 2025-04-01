// Jest setup file for EventraAI

// Import necessary testing libraries
import '@testing-library/jest-dom';
import { setLogger } from 'react-query';
import 'whatwg-fetch'; // Polyfill for fetch API

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '',
    query: {},
    asPath: '',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    }
  })
}));

// Suppress React Query error logging in tests
setLogger({
  log: console.log,
  warn: console.warn,
  error: () => {} // Don't log errors to console in tests
});

// Setup global variables
global.mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  display_name: 'Test User',
  is_admin: false,
  subscription_tier: 'free',
  subscription_status: 'active'
};

// Test environment setup for Supabase
const mockSupabaseAuth = {
  getSession: jest.fn().mockResolvedValue({
    data: { session: { user: global.mockUser } },
    error: null
  }),
  signInWithPassword: jest.fn().mockResolvedValue({
    data: { user: global.mockUser },
    error: null
  }),
  signOut: jest.fn().mockResolvedValue({
    error: null
  }),
  onAuthStateChange: jest.fn().mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } }
  })
};

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  createBrowserSupabaseClient: jest.fn().mockReturnValue({
    auth: mockSupabaseAuth,
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: null
      }),
      maybeSingle: jest.fn().mockResolvedValue({
        data: null,
        error: null
      }),
      range: jest.fn().mockReturnThis()
    })
  }),
  createServerClient: jest.fn().mockReturnValue({
    auth: mockSupabaseAuth,
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: null
      }),
      range: jest.fn().mockReturnThis()
    })
  })
}));

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  NODE_ENV: 'test'
};

// Global test utilities
global.mockFetch = (status, data) => {
  return jest.fn().mockImplementation(() => 
    Promise.resolve({
      status,
      ok: status >= 200 && status < 300,
      json: () => Promise.resolve(data)
    })
  );
};

// Clean up after tests
afterEach(() => {
  // Clean up any global mocks
  jest.clearAllMocks();
});
