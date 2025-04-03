'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  status: string
  link?: string
  data?: any
  created_at: string
  read_at?: string
}

interface UseNotificationsOptions {
  pollingInterval?: number // in milliseconds
  limit?: number
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { pollingInterval = 30000, limit = 50 } = options
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  // Fetch notifications
  const fetchNotifications = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true)
      }
      
      console.log('[DEBUG] Fetching notifications with limit:', limit)
      
      // Add retry logic and better error handling
      const fetchWithRetry = async (retryCount = 0, maxRetries = 3) => {
        try {
          const response = await fetch(`/api/notifications?limit=${limit}`)
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error(`[DEBUG] Notifications API error (${response.status}):`, errorText)
            
            // Special handling for 401 Unauthorized - the user is not logged in
            if (response.status === 401) {
              console.log('[DEBUG] User is not authenticated, returning empty notifications')
              // Return empty data instead of throwing
              return {
                notifications: [],
                unreadCount: 0
              }
            }
            
            throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`)
          }
          
          return await response.json()
        } catch (fetchError) {
          console.error(`[DEBUG] Fetch error (attempt ${retryCount + 1}/${maxRetries}):`, fetchError)
          
          // If we have retries left, wait and try again
          if (retryCount < maxRetries - 1) {
            const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff: 1s, 2s, 4s, etc.
            console.log(`[DEBUG] Retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            return fetchWithRetry(retryCount + 1, maxRetries)
          }
          
          throw fetchError
        }
      }
      
      const data = await fetchWithRetry()
      console.log('[DEBUG] Notifications fetched successfully:', 
                 data.notifications?.length || 0, 'notifications,', 
                 data.unreadCount || 0, 'unread')
      
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
      setError(null)
    } catch (err) {
      console.error('[DEBUG] Error fetching notifications:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'))
      
      if (showLoading) {
        toast({
          title: 'Error',
          description: 'Failed to load notifications. Please try again later.',
          variant: 'destructive',
        })
      }
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }, [limit, toast])

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      console.log('[DEBUG] Marking notifications as read:', notificationIds)
      
      // Add retry logic similar to fetchNotifications
      const updateWithRetry = async (retryCount = 0, maxRetries = 3) => {
        try {
          const response = await fetch('/api/notifications', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notificationIds }),
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error(`[DEBUG] Mark as read API error (${response.status}):`, errorText)
            throw new Error(`Failed to mark notifications as read: ${response.status} ${response.statusText}`)
          }
          
          return await response.json()
        } catch (fetchError) {
          console.error(`[DEBUG] Mark as read error (attempt ${retryCount + 1}/${maxRetries}):`, fetchError)
          
          // If we have retries left, wait and try again
          if (retryCount < maxRetries - 1) {
            const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
            console.log(`[DEBUG] Retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            return updateWithRetry(retryCount + 1, maxRetries)
          }
          
          throw fetchError
        }
      }
      
      // Attempt to update with retry logic
      await updateWithRetry()
      console.log('[DEBUG] Successfully marked notifications as read')
      
      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notificationIds.includes(notification.id)
            ? { ...notification, status: 'read', read_at: new Date().toISOString() }
            : notification
        )
      )
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      
      return true
    } catch (err) {
      console.error('[DEBUG] Error marking notifications as read:', err)
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read. Please try again.',
        variant: 'destructive',
      })
      return false
    }
  }, [toast])

  // Set up polling - only if user is authenticated
  useEffect(() => {
    // Check for authentication before fetching
    const checkAuth = async () => {
      try {
        // Use a simple request to check auth status without showing errors
        const response = await fetch('/api/health/auth-check')
        const isAuthenticated = response.ok
        
        console.log('[DEBUG] Auth check before notifications:', isAuthenticated ? 'Authenticated' : 'Not authenticated')
        
        if (isAuthenticated) {
          // Initial fetch only if authenticated
          fetchNotifications()
          
          // Set up polling interval
          const intervalId = setInterval(() => {
            fetchNotifications(false) // Don't show loading state for polling
          }, pollingInterval)
          
          return () => clearInterval(intervalId)
        } else {
          console.log('[DEBUG] Not authenticated, skipping notifications fetch')
          // Clear any existing data if not authenticated
          setNotifications([])
          setUnreadCount(0)
        }
      } catch (e) {
        console.error('[DEBUG] Auth check error:', e)
        // On error, attempt fetch but don't show errors
        fetchNotifications(false)
      }
    }
    
    checkAuth()
    
    // Listen for auth state changes (optional enhancement)
    const handleAuthChange = () => {
      console.log('[DEBUG] Auth state might have changed, rechecking')
      checkAuth()
    }
    
    // Listen for storage events as a simple way to detect auth changes
    window.addEventListener('storage', handleAuthChange)
    
    return () => {
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [fetchNotifications, pollingInterval])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
  }
} 