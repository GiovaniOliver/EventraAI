import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/events/route';
import { createServerClient } from '@/lib/supabase';
import { withAuth } from '@/lib/auth-middleware';

// Mock the auth middleware
jest.mock('@/lib/auth-middleware', () => ({
  withAuth: jest.fn((handler) => handler),
  hasSubscriptionAccess: jest.fn().mockResolvedValue(true),
}));

// Mock the Supabase client
jest.mock('@/lib/supabase', () => ({
  createServerClient: jest.fn(),
}));

describe('Events API Endpoints', () => {
  // Mock data
  const mockEvents = [
    {
      id: '1',
      title: 'Test Event 1',
      type: 'conference',
      format: 'hybrid',
      status: 'upcoming',
      owner_id: 'user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Test Event 2',
      type: 'workshop',
      format: 'in-person',
      status: 'planning',
      owner_id: 'user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // Mock Supabase responses
  const mockSelect = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockReturnThis();
  const mockOrder = jest.fn().mockReturnThis();
  const mockRange = jest.fn().mockReturnThis();
  const mockFrom = jest.fn().mockReturnValue({
    select: mockSelect,
    eq: mockEq,
    order: mockOrder,
    range: mockRange,
  });

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    is_admin: false,
    subscription_tier: 'free',
    subscription_status: 'active',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock response for events query
    mockRange.mockResolvedValue({
      data: mockEvents,
      error: null,
      count: mockEvents.length,
    });
    
    // Setup Supabase client mock
    (createServerClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    });
  });

  describe('GET /api/events', () => {
    it('should return events with pagination', async () => {
      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/events?limit=10&offset=0');
      
      // Call the handler
      const response = await GET(request, mockUser);
      const responseData = await response.json();
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toHaveProperty('events');
      expect(responseData).toHaveProperty('pagination');
      expect(responseData.events).toEqual(mockEvents);
      expect(responseData.pagination).toEqual({
        limit: 10,
        offset: 0,
        total: mockEvents.length,
      });
      
      // Verify the Supabase calls
      expect(createServerClient).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith('events');
      expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(mockEq).toHaveBeenCalledWith('owner_id', 'user-123');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockRange).toHaveBeenCalled();
    });

    it('should handle filter by status', async () => {
      // Create mock request with status filter
      const request = new NextRequest('http://localhost:3000/api/events?status=upcoming');
      
      // Call the handler
      await GET(request, mockUser);
      
      // Verify that eq was called with status filter
      expect(mockEq).toHaveBeenCalledWith('status', 'upcoming');
    });

    it('should handle filter by type', async () => {
      // Create mock request with type filter
      const request = new NextRequest('http://localhost:3000/api/events?type=conference');
      
      // Call the handler
      await GET(request, mockUser);
      
      // Verify that eq was called with type filter
      expect(mockEq).toHaveBeenCalledWith('type', 'conference');
    });

    it('should handle error from Supabase', async () => {
      // Setup mock error response
      mockRange.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });
      
      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/events');
      
      // Call the handler
      const response = await GET(request, mockUser);
      const responseData = await response.json();
      
      // Verify the error response
      expect(response.status).toBe(500);
      expect(responseData).toHaveProperty('error', 'Database error');
    });
  });

  describe('POST /api/events', () => {
    it('should create a new event', async () => {
      // Mock request body
      const requestBody = {
        title: 'New Test Event',
        type: 'conference',
        format: 'virtual',
        status: 'draft',
      };
      
      // Setup mock insert response
      const mockInsert = jest.fn().mockResolvedValue({
        data: { ...requestBody, id: '3' },
        error: null,
      });
      const mockSingle = jest.fn().mockResolvedValue({
        data: { ...requestBody, id: '3' },
        error: null,
      });
      
      // Update Supabase client mock for insert
      mockFrom.mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
        eq: mockEq,
        single: mockSingle,
      });
      
      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      // Call the handler
      const response = await POST(request, mockUser);
      const responseData = await response.json();
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toHaveProperty('id', '3');
      expect(responseData).toHaveProperty('title', 'New Test Event');
      
      // Verify the Supabase calls
      expect(createServerClient).toHaveBeenCalled();
    });

    it('should validate the request body', async () => {
      // Mock invalid request body (missing required field)
      const requestBody = {
        // Missing title
        type: 'conference',
      };
      
      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      // Call the handler
      const response = await POST(request, mockUser);
      const responseData = await response.json();
      
      // Verify the validation error response
      expect(response.status).toBe(422);
      expect(responseData).toHaveProperty('error', 'Validation error');
      expect(responseData).toHaveProperty('details');
    });

    it('should handle error from Supabase during insert', async () => {
      // Mock request body
      const requestBody = {
        title: 'New Test Event',
        type: 'conference',
        format: 'virtual',
        status: 'draft',
      };
      
      // Setup mock insert error
      const mockInsert = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Insert error' },
      });
      
      // Update Supabase client mock for insert error
      mockFrom.mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
        eq: mockEq,
      });
      
      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      // Call the handler
      const response = await POST(request, mockUser);
      const responseData = await response.json();
      
      // Verify the error response
      expect(response.status).toBe(500);
      expect(responseData).toHaveProperty('error', 'Insert error');
    });
  });
});
