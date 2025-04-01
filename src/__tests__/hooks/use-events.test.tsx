import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEvents } from '@/hooks/use-events';
import { AuthContext } from '@/app/providers';
import { User } from '@/lib/supabase';
import React from 'react';

// Mock data
const mockEvents = [
  {
    id: '1',
    title: 'Test Event 1',
    type: 'conference',
    format: 'hybrid',
    status: 'upcoming',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Test Event 2',
    type: 'workshop',
    format: 'in-person',
    status: 'planning',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Mock fetch implementation
const mockFetchResponse = {
  events: mockEvents,
  pagination: {
    limit: 10,
    offset: 0,
    total: 2,
  },
};

// Mock AuthContext value
const mockUser: User = {
  id: 'user-123',
  username: 'testuser',
  display_name: 'Test User',
  email: 'test@example.com',
  is_admin: false,
  subscription_tier: 'free',
  subscription_status: 'active',
  created_at: new Date().toISOString(),
};

const mockAuthContext = {
  isLoading: false,
  user: mockUser,
  error: null,
  refresh: jest.fn(),
};

// Setup wrapper for the hook
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={mockAuthContext}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AuthContext.Provider>
  );
};

describe('useEvents hook', () => {
  // Mock global fetch
  const originalFetch = global.fetch;
  
  beforeAll(() => {
    global.fetch = jest.fn();
  });
  
  afterAll(() => {
    global.fetch = originalFetch;
  });
  
  beforeEach(() => {
    // Reset fetch mock before each test
    jest.resetAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockFetchResponse,
    });
  });
  
  it('should fetch events successfully', async () => {
    const { result, waitFor } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });
    
    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.events).toEqual([]);
    
    // Wait for the query to complete
    await waitFor(() => !result.current.isLoading);
    
    // Verify the events were fetched
    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.pagination).toEqual(mockFetchResponse.pagination);
    expect(global.fetch).toHaveBeenCalled();
    
    // Verify the URL and parameters
    const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(fetchUrl).toContain('/api/events');
    expect(fetchUrl).toContain('limit=10');
    expect(fetchUrl).toContain('offset=0');
  });
  
  it('should handle filter changes', async () => {
    const { result, waitFor } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });
    
    // Wait for initial fetch to complete
    await waitFor(() => !result.current.isLoading);
    
    // Update the filter
    await act(async () => {
      result.current.updateFilter({ status: 'upcoming' });
    });
    
    // Wait for the refetch to complete
    await waitFor(() => !result.current.isLoading);
    
    // Verify the fetchUrl after filter change
    const fetchUrl = (global.fetch as jest.Mock).mock.calls[1][0];
    expect(fetchUrl).toContain('status=upcoming');
  });
  
  it('should handle changing page', async () => {
    const { result, waitFor } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });
    
    // Wait for initial fetch to complete
    await waitFor(() => !result.current.isLoading);
    
    // Change page
    await act(async () => {
      result.current.changePage(10);
    });
    
    // Wait for the refetch to complete
    await waitFor(() => !result.current.isLoading);
    
    // Verify the fetchUrl after page change
    const fetchUrl = (global.fetch as jest.Mock).mock.calls[1][0];
    expect(fetchUrl).toContain('offset=10');
  });
  
  it('should handle error when fetching events', async () => {
    // Mock fetch to reject
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { result, waitFor } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });
    
    // Wait for the query to complete
    await waitFor(() => !result.current.isLoading);
    
    // Verify error state
    expect(result.current.error).toBeTruthy();
    expect(result.current.events).toEqual([]);
  });
  
  it('should create an event successfully', async () => {
    // Mock fetch for the mutation
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: '3', title: 'New Event', ...JSON.parse(options.body) }),
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: async () => mockFetchResponse,
      });
    });
    
    const { result, waitFor } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });
    
    // Wait for initial fetch to complete
    await waitFor(() => !result.current.isLoading);
    
    // Create a new event
    let newEventResult;
    await act(async () => {
      newEventResult = await result.current.createEvent.mutateAsync({
        title: 'New Event',
        type: 'workshop',
        status: 'draft',
      });
    });
    
    // Verify the new event
    expect(newEventResult).toHaveProperty('id', '3');
    expect(newEventResult).toHaveProperty('title', 'New Event');
    
    // Verify the POST request
    const postCall = (global.fetch as jest.Mock).mock.calls.find(
      call => call[1]?.method === 'POST'
    );
    expect(postCall).toBeTruthy();
    expect(postCall[0]).toEqual('/api/events');
    expect(JSON.parse(postCall[1].body)).toHaveProperty('title', 'New Event');
  });
});
