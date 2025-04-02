'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Calendar,
  BarChart,
  Settings,
  Users,
  Store,
  Home,
  PlusCircle,
  Sparkles,
  LogOut,
  Gauge,
  FileClock,
  ClipboardList,
  MessageSquare,
  HelpCircle,
  LifeBuoy,
  Shield,
  CreditCard,
  UserCog,
  BookUser
} from 'lucide-react'
import NewEventModal from '@/components/modals/new-event-modal'

// Define Auth interface to fix TypeScript errors
interface Auth {
  user: any;
  logout?: () => Promise<void>;
  // Add other properties as needed
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    title: 'Events',
    href: '/events',
    icon: Calendar
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart
  },
  {
    title: 'Discover',
    href: '/discover',
    icon: Sparkles
  },
  {
    title: 'Vendors',
    href: '/vendors',
    icon: Store
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings
  }
]

// Admin-only items
const adminItems = [
  {
    title: 'Admin',
    href: '/admin',
    icon: Users
  }
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { user } = useAuth() as unknown as Auth // Cast to fix TypeScript errors
  const [collapsed, setCollapsed] = useState(false)
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false)
  
  const isActive = (path: string) => 
    path === '/' 
      ? pathname === path 
      : pathname?.startsWith(path)
  
  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-background pb-8 transition-all duration-300",
      collapsed ? "w-[70px]" : "w-[240px]",
      className
    )}>
      <div className="flex-1 overflow-auto py-2">
        {/* Toggle button */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors"
        >
          {collapsed ? 
            <ChevronRight className="h-3 w-3" /> : 
            <ChevronLeft className="h-3 w-3" />}
        </button>
        
        <div className="px-3 py-2">
          <h2 className={cn(
            "mb-2 px-4 text-lg font-semibold tracking-tight transition-opacity duration-300",
            collapsed ? "opacity-0" : "opacity-100"
          )}>
            Main Menu
          </h2>
          <div className="space-y-1">
            {navItems.map(item => (
              <Button
                key={item.href}
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className={cn(
                  "justify-start",
                  collapsed ? "w-10 px-0" : "w-full",
                  isActive(item.href) 
                    ? "bg-secondary font-medium" 
                    : "font-normal"
                )}
                size="sm"
                asChild
              >
                <Link href={item.href} className={cn(
                  "flex items-center",
                  collapsed ? "justify-center" : "justify-start"
                )}>
                  <item.icon className={collapsed ? "h-5 w-5" : "mr-2 h-4 w-4"} />
                  {!collapsed && item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Only show admin links to admin users */}
        {user?.is_admin && (
          <div className="px-3 py-2">
            <h2 className={cn(
            "mb-2 px-4 text-lg font-semibold tracking-tight transition-opacity duration-300",
              collapsed ? "opacity-0" : "opacity-100"
          )}>
            Administration
          </h2>
            <div className="space-y-1">
              {adminItems.map(item => (
                <Button
                  key={item.href}
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start",
                    collapsed ? "w-10 px-0" : "w-full",
                    isActive(item.href) 
                      ? "bg-secondary font-medium" 
                      : "font-normal"
                  )}
                  size="sm"
                  asChild
                >
                  <Link href={item.href} className={cn(
                    "flex items-center",
                    collapsed ? "justify-center" : "justify-start"
                  )}>
                    <item.icon className={collapsed ? "h-5 w-5" : "mr-2 h-4 w-4"} />
                    {!collapsed && item.title}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-auto px-3">
        <Button
          className={collapsed ? "mx-auto w-10 px-0" : "w-full"}
          onClick={() => setIsNewEventModalOpen(true)}
        >
          <div className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "justify-start"
          )}>
            <PlusCircle className={collapsed ? "h-5 w-5" : "mr-2 h-4 w-4"} />
            {!collapsed && "Create Event"}
          </div>
        </Button>
      </div>

      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
      />
    </div>
  )
}
