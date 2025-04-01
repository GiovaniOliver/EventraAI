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
      
      const response = await fetch(`/api/notifications?limit=${limit}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }
      
      const data = await response.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
      setError(null)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'))
      
      if (showLoading) {
        toast({
          title: 'Error',
          description: 'Failed to load notifications',
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
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to mark notifications as read')
      }
      
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
      console.error('Error marking notifications as read:', err)
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive',
      })
      return false
    }
  }, [toast])

  // Set up polling
  useEffect(() => {
    // Initial fetch
    fetchNotifications()

    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchNotifications(false) // Don't show loading state for polling
    }, pollingInterval)

    return () => clearInterval(intervalId)
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