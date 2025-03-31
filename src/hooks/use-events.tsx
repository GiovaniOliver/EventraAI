'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState } from 'react'
import { useAuth } from './use-auth'

// Event type definition
export interface Event {
  id: string
  title: string
  name?: string  // For backwards compatibility with original codebase
  description?: string
  location?: string
  start_date?: string
  end_date?: string
  date?: string  // For backwards compatibility with original codebase
  type?: string
  format?: string
  estimatedGuests?: number
  budget?: number | null
  status: 'draft' | 'upcoming' | 'in-progress' | 'completed' | 'cancelled' | 'planning'
  userId?: string
  user_id?: string
  created_at: string
  updated_at: string
}

// Response type for the events list
interface EventsResponse {
  events: Event[]
  pagination: {
    limit: number
    offset: number
    total: number
  }
}

export function useEvents(initialFilter?: string) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  // Pagination state
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
  })
  
  // Optional filter state with initialFilter support
  const [filter, setFilter] = useState<{
    status?: 'draft' | 'upcoming' | 'in-progress' | 'completed' | 'cancelled' | 'planning'
  }>(initialFilter ? { status: initialFilter as any } : {})

  // Fetch events list
  const { data, isLoading, error, refetch } = useQuery<EventsResponse>({
    queryKey: ['events', pagination, filter],
    queryFn: async () => {
      // Build query string
      const queryParams = new URLSearchParams()
      queryParams.append('limit', pagination.limit.toString())
      queryParams.append('offset', pagination.offset.toString())
      
      // Add filters if they exist
      if (filter.status) {
        queryParams.append('status', filter.status)
      }
      
      // Only use mock data if explicitly in development mode with the NEXT_PUBLIC_USE_MOCK_DATA flag
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        return {
          events: [
            {
              id: '1',
              title: 'Annual Conference',
              name: 'Annual Conference',
              description: 'Our annual tech conference',
              type: 'conference',
              format: 'hybrid',
              date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'upcoming',
              user_id: user?.id || '1',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: '2',
              title: 'Team Building Workshop',
              name: 'Team Building Workshop',
              description: 'Company team building event',
              type: 'workshop',
              format: 'in-person',
              date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'planning',
              user_id: user?.id || '1',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          pagination: {
            limit: pagination.limit,
            offset: pagination.offset,
            total: 2,
          },
        }
      }
      
      // Use the real API endpoint
      try {
        const response = await fetch(`/api/events?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching events: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch events:', error);
        throw error;
      }
    },
  })

  // Get a single event
  const useEvent = (id?: string) => {
    return useQuery<Event>({
      queryKey: ['event', id],
      queryFn: async () => {
        if (!id) throw new Error('Event ID is required')
        
        // Only use mock data if explicitly in development mode with the NEXT_PUBLIC_USE_MOCK_DATA flag
        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
          return {
            id,
            title: 'Annual Conference',
            name: 'Annual Conference',
            description: 'Our annual tech conference with industry experts',
            location: 'Convention Center',
            type: 'conference',
            format: 'hybrid',
            estimatedGuests: 500,
            budget: 50000,
            date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'planning',
            user_id: user?.id || '1',
            userId: user?.id || '1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        }
        
        // Use the real API endpoint
        try {
          const response = await fetch(`/api/events/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`Error fetching event: ${response.statusText}`);
          }
          
          return await response.json();
        } catch (error) {
          console.error(`Failed to fetch event with ID ${id}:`, error);
          throw error;
        }
      },
      enabled: !!id, // Only run the query if id is provided
    })
  }

  // Create a new event
  const createEvent = useMutation({
    mutationFn: async (newEvent: Partial<Event>) => {
      // Ensure both title and name fields are set
      const eventData = {
        ...newEvent,
        name: newEvent.title || newEvent.name,
        title: newEvent.title || newEvent.name,
        user_id: user?.id,
        userId: user?.id,
      }
      
      // Only use mock data if explicitly in development mode with the NEXT_PUBLIC_USE_MOCK_DATA flag
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        return Promise.resolve({
          ...eventData,
          id: Math.random().toString().substr(2, 9),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Event)
      }
      
      // Use the real API endpoint
      try {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        });
        
        if (!response.ok) {
          throw new Error(`Error creating event: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Failed to create event:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch events list
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  // Update an event
  const updateEvent = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Event> }) => {
      // Only use mock data if explicitly in development mode with the NEXT_PUBLIC_USE_MOCK_DATA flag
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        return Promise.resolve({
          ...data,
          id,
          updated_at: new Date().toISOString(),
        } as Event)
      }
      
      // Use the real API endpoint
      try {
        const response = await fetch(`/api/events/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error(`Error updating event: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Failed to update event with ID ${id}:`, error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update both the list and the individual event in the cache
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event', data.id] })
    },
  })

  // Delete an event
  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      // Only use mock data if explicitly in development mode with the NEXT_PUBLIC_USE_MOCK_DATA flag
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        return Promise.resolve({})
      }
      
      // Use the real API endpoint
      try {
        const response = await fetch(`/api/events/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Error deleting event: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Failed to delete event with ID ${id}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch events list
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  // Change page
  const changePage = (newOffset: number) => {
    setPagination((prev) => ({
      ...prev,
      offset: newOffset,
    }))
  }

  // Change items per page
  const changeLimit = (newLimit: number) => {
    setPagination({
      limit: newLimit,
      offset: 0, // Reset to first page when changing limit
    })
  }

  // Update filters
  const updateFilter = (newFilter: typeof filter) => {
    setFilter(newFilter)
    // Reset pagination when changing filters
    setPagination((prev) => ({
      ...prev,
      offset: 0,
    }))
  }

  return {
    // Data and loading state
    events: data?.events || [],
    pagination: data?.pagination || { limit: pagination.limit, offset: pagination.offset, total: 0 },
    isLoading,
    error,
    refetch,
    
    // Mutation functions
    createEvent,
    updateEvent,
    deleteEvent,
    
    // Pagination controls
    changePage,
    changeLimit,
    
    // Filter controls
    filter,
    updateFilter,
    
    // Individual event hook
    useEvent,
  }
}