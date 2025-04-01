'use client'

import React, { useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useNotifications } from '@/hooks/use-notifications'

export default function NotificationPopover() {
  const [isOpen, setIsOpen] = React.useState(false)
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
  } = useNotifications({
    pollingInterval: 30000, // Poll every 30 seconds
  })

  // Mark all visible unread notifications as read when popover closes
  useEffect(() => {
    if (!isOpen) {
      const unreadIds = notifications
        .filter(n => n.status === 'unread')
        .map(n => n.id)
      
      if (unreadIds.length > 0) {
        markAsRead(unreadIds)
      }
    }
  }, [isOpen, notifications, markAsRead])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5 notification-icon" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center notification-count"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h4 className="font-semibold">Notifications</h4>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => fetchNotifications()}
            >
              Refresh
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[calc(100vh-20rem)] min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex flex-col gap-1 px-4 py-3 transition-colors",
                    notification.status === 'unread' && "bg-muted/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-medium">{notification.title}</h5>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  {notification.link && (
                    <Button
                      variant="link"
                      className="px-0 text-xs h-auto"
                      asChild
                    >
                      <a href={notification.link}>View Details</a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
} 