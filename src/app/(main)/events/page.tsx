'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import EventList from '@/components/EventList'
import { Button } from '@/components/ui/button'
import { Loader2, PlusCircle, CalendarCheck, Filter } from 'lucide-react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function EventsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--eventra-blue))] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your events...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Your Events
        </h1>
        <p className="text-muted-foreground">
          Manage and track all your upcoming events
        </p>
      </div>

      {/* Action Bar and Event List Containers */}
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-muted/50 w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 w-9"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => router.push('/events/new')}
              size="sm"
              className="flex items-center gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              New Event
            </Button>
          </div>
        </div>

        <div className="subtle-gradient-card p-6">
          <TabsContent value="all">
            <EventList 
              showFilters={showFilters}
              showPagination={true}
              filter="all"
              emptyMessage="You don't have any events yet. Create your first event to get started."
            />
          </TabsContent>
          
          <TabsContent value="upcoming">
            <EventList 
              showFilters={showFilters}
              showPagination={true}
              filter="upcoming"
              emptyMessage="You don't have any upcoming events scheduled."
            />
          </TabsContent>
          
          <TabsContent value="past">
            <EventList 
              showFilters={showFilters}
              showPagination={true}
              filter="past"
              emptyMessage="You don't have any past events."
            />
          </TabsContent>
          
          <TabsContent value="draft">
            <EventList 
              showFilters={showFilters}
              showPagination={true}
              filter="draft"
              emptyMessage="You don't have any events in draft status."
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
} 