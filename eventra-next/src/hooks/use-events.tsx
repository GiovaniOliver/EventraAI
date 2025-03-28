'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState } from 'react'

// Event type definition
export interface Event {
  id: string
  title: string
  description?: string
  location?: string
  start_date?: string
  end_date?: string
  status: 'draft' | 'upcoming' | 'in-progress' | 'completed' | 'cancelled'
  user_id: string
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

export function useEvents() {
  const queryClient = useQueryClient()
  
  // Pagination state
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
  })
  
  // Optional filter state
  const [filter, setFilter] = useState<{
    status?: 'draft' | 'upcoming' | 'in-progress' | 'completed' | 'cancelled'
  }>({})

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
      
      return api.get<EventsResponse>(`/events?${queryParams.toString()}`)
    },
  })

  // Get a single event
  const useEvent = (id?: string) => {
    return useQuery<Event>({
      queryKey: ['event', id],
      queryFn: async () => {
        if (!id) throw new Error('Event ID is required')
        return api.get<Event>(`/events/${id}`)
      },
      enabled: !!id, // Only run the query if id is provided
    })
  }

  // Create a new event
  const createEvent = useMutation({
    mutationFn: (newEvent: Partial<Event>) => {
      return api.post<Event>('/events', newEvent)
    },
    onSuccess: () => {
      // Invalidate and refetch events list
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  // Update an event
  const updateEvent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) => {
      return api.patch<Event>(`/events/${id}`, data)
    },
    onSuccess: (data) => {
      // Update both the list and the individual event in the cache
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event', data.id] })
    },
  })

  // Delete an event
  const deleteEvent = useMutation({
    mutationFn: (id: string) => {
      return api.delete(`/events/${id}`)
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