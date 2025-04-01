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
      
      // Add user ID filter if user is authenticated
      if (user?.id) {
        queryParams.append('userId', user.id)
      }
      
      try {
        // Add request timeout for better user experience
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
        
        const response = await fetch(`/api/events?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache' // Ensure we get fresh data
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId) // Clear the timeout if the request completes
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            `Error fetching events: ${response.statusText}. ` + 
            `Details: ${errorData?.error || 'Unknown error'}`
          )
        }
        
        const result = await response.json()
        
        // Validate the response structure
        if (!Array.isArray(result.events)) {
          console.error('Invalid response format, expected events array:', result)
          throw new Error('Invalid server response format')
        }
        
        return result
      } catch (error) {
        console.error('Failed to fetch events:', error)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.')
        }
        throw error
      }
    },
    retry: 2, // Retry failed requests twice
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  })

  // Get a single event
  const useEvent = (id?: string) => {
    return useQuery<Event>({
      queryKey: ['event', id],
      queryFn: async () => {
        if (!id) throw new Error('Event ID is required')
        
        try {
          // Add request timeout for better user experience
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
          
          const response = await fetch(`/api/events/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache' // Ensure we get fresh data
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId) // Clear the timeout if the request completes
          
          if (!response.ok) {
            // Try to get detailed error information
            const errorData = await response.json().catch(() => ({}))
            
            if (response.status === 404) {
              throw new Error(`Event not found. It may have been deleted or you may not have permission to access it.`)
            }
            
            throw new Error(
              `Error fetching event: ${response.statusText}. ` +
              `Details: ${errorData?.error || 'Unknown error'}`
            )
          }
          
          const eventData = await response.json()
          
          // Validate the response structure
          if (!eventData || typeof eventData !== 'object' || !eventData.id) {
            console.error('Invalid event data received:', eventData)
            throw new Error('Invalid event data received from server')
          }
          
          return eventData
        } catch (error) {
          console.error(`Failed to fetch event with ID ${id}:`, error)
          
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              throw new Error('Request timed out. Please try again.')
            }
            // Rethrow the original error with context
            throw new Error(`Failed to load event: ${error.message}`)
          }
          
          // For unknown errors
          throw new Error('An unexpected error occurred while loading the event')
        }
      },
      enabled: !!id, // Only run the query if id is provided
      retry: 2, // Retry failed requests twice
      staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    })
  }

  // Create a new event
  const createEvent = useMutation({
    mutationFn: async (newEvent: Partial<Event>) => {
      // Validate required fields
      if (!newEvent.title && !newEvent.name) {
        throw new Error('Event title is required')
      }
      
      // Ensure both title and name fields are set for backward compatibility
      const eventData = {
        ...newEvent,
        name: newEvent.title || newEvent.name,
        title: newEvent.title || newEvent.name,
        user_id: user?.id,
        userId: user?.id,
        // Set default values if not provided
        status: newEvent.status || 'draft',
        type: newEvent.type || 'other',
        format: newEvent.format || 'in-person',
      }
      
      try {
        // Add request timeout for better user experience
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
        
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId) // Clear the timeout if the request completes
        
        // Handle different error scenarios
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          
          if (response.status === 401) {
            throw new Error('You must be logged in to create an event')
          }
          
          if (response.status === 403) {
            throw new Error('You do not have permission to create events')
          }
          
          if (response.status === 422) {
            throw new Error(`Validation error: ${errorData?.error || 'Invalid event data'}`)
          }
          
          throw new Error(
            `Error creating event: ${response.statusText}. ` + 
            `Details: ${errorData?.error || 'Unknown error'}`
          )
        }
        
        // Parse and validate response
        const createdEvent = await response.json()
        
        // Validate returned data has required fields
        if (!createdEvent || !createdEvent.id) {
          throw new Error('Invalid response from server')
        }
        
        return createdEvent
      } catch (error) {
        console.error('Failed to create event:', error)
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.')
          }
          // Rethrow with context
          throw new Error(`Failed to create event: ${error.message}`)
        }
        
        // For unknown errors
        throw new Error('An unexpected error occurred while creating the event')
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch events list
      queryClient.invalidateQueries({ queryKey: ['events'] })
      // Show success message via toast or other notification method
      console.log(`Event "${data.title}" created successfully with ID: ${data.id}`)
    },
    onError: (error) => {
      // Log the error for debugging
      console.error('Event creation error:', error)
    }
  })

  // Update an event
  const updateEvent = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Event> }) => {
      // Validate input
      if (!id) {
        throw new Error('Event ID is required')
      }
      
      // If trying to update title/name, ensure consistency
      const updateData = { ...data }
      if (updateData.title) {
        updateData.name = updateData.title
      } else if (updateData.name) {
        updateData.title = updateData.name
      }
      
      try {
        // Add request timeout for better user experience
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
        
        const response = await fetch(`/api/events/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId) // Clear the timeout if the request completes
        
        // Handle different error scenarios
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          
          if (response.status === 401) {
            throw new Error('You must be logged in to update this event')
          }
          
          if (response.status === 403) {
            throw new Error('You do not have permission to update this event')
          }
          
          if (response.status === 404) {
            throw new Error('Event not found. It may have been deleted.')
          }
          
          if (response.status === 422) {
            throw new Error(`Validation error: ${errorData?.error || 'Invalid event data'}`)
          }
          
          throw new Error(
            `Error updating event: ${response.statusText}. ` + 
            `Details: ${errorData?.error || 'Unknown error'}`
          )
        }
        
        // Parse and validate response
        const updatedEvent = await response.json()
        
        // Validate returned data has required fields
        if (!updatedEvent || !updatedEvent.id) {
          throw new Error('Invalid response from server')
        }
        
        return updatedEvent
      } catch (error) {
        console.error(`Failed to update event with ID ${id}:`, error)
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.')
          }
          // Rethrow with context
          throw new Error(`Failed to update event: ${error.message}`)
        }
        
        // For unknown errors
        throw new Error('An unexpected error occurred while updating the event')
      }
    },
    onSuccess: (data) => {
      // Update both the list and the individual event in the cache
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event', data.id] })
      // Show success message
      console.log(`Event "${data.title}" updated successfully`)
    },
    onError: (error) => {
      // Log the error for debugging
      console.error('Event update error:', error)
    }
  })

  // Delete an event
  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      // Validate input
      if (!id) {
        throw new Error('Event ID is required')
      }
      
      try {
        // Add request timeout for better user experience
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch(`/api/events/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId) // Clear the timeout if the request completes
        
        // Handle different error scenarios
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          
          if (response.status === 401) {
            throw new Error('You must be logged in to delete this event')
          }
          
          if (response.status === 403) {
            throw new Error('You do not have permission to delete this event')
          }
          
          if (response.status === 404) {
            throw new Error('Event not found. It may have already been deleted.')
          }
          
          throw new Error(
            `Error deleting event: ${response.statusText}. ` + 
            `Details: ${errorData?.error || 'Unknown error'}`
          )
        }
        
        // Return the deletion result or an empty object if none provided
        return await response.json().catch(() => ({ success: true }))
      } catch (error) {
        console.error(`Failed to delete event with ID ${id}:`, error)
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.')
          }
          // Rethrow with context
          throw new Error(`Failed to delete event: ${error.message}`)
        }
        
        // For unknown errors
        throw new Error('An unexpected error occurred while deleting the event')
      }
    },
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch events list
      queryClient.invalidateQueries({ queryKey: ['events'] })
      // Remove the specific event from cache
      queryClient.removeQueries({ queryKey: ['event', deletedId] })
      // Show success message
      console.log(`Event deleted successfully`)
    },
    onError: (error) => {
      // Log the error for debugging
      console.error('Event deletion error:', error)
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