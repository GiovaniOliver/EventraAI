'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Calendar, 
  Users, 
  MessageSquare, 
  Clock, 
  DollarSign,
  Loader2,
  BarChart2,
  AlertTriangle
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface EventBasic {
  id: string;
  title: string;
}

interface AnalyticsData {
  totalRegistrations: number;
  registrationsChange: number;
  attendance: number;
  attendanceRate: number;
  attendanceChange: number;
  feedback: number;
  feedbackChange: number;
  revenue: number;
  revenueChange: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  
  // Fix the user and isLoading type issue by using type assertion
  const auth = useAuth() as any;
  const user = auth.user;
  const authLoading = auth.isLoading;
  
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("7d");
  const [timeframeOptions] = useState([
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "all", label: "All time" },
  ]);

  // Fetch user's events
  const { 
    data: events = [], 
    isLoading: eventsLoading,
    error: eventsError
  } = useQuery<EventBasic[]>({
    queryKey: ["events", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const response = await fetch('/api/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching events: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.events || [];
    },
    enabled: !!user,
  });

  // Fetch analytics data for selected event
  const { 
    data: analyticsData, 
    isLoading: analyticsLoading,
    error: analyticsError
  } = useQuery<AnalyticsData>({
    queryKey: ["analytics", selectedEvent, selectedTimeframe],
    queryFn: async () => {
      if (!selectedEvent) return null;
      
      const response = await fetch(`/api/events/${selectedEvent}/analytics?timeframe=${selectedTimeframe}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching analytics: ${response.statusText}`);
      }
      
      const data = await response.json();
      // The API returns an array, so we need to get the first item or use default values
      return data[0] || {
        totalRegistrations: 0,
        registrationsChange: 0,
        attendance: 0,
        attendanceRate: 0,
        attendanceChange: 0,
        feedback: 0,
        feedbackChange: 0,
        revenue: 0,
        revenueChange: 0
      };
    },
    enabled: !!selectedEvent,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Set first event as default when events load
  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0].id);
    }
  }, [events, selectedEvent]);

  if (authLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--eventra-blue))] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const hasEvents = events.length > 0;
  const hasSelectedEvent = !!selectedEvent;
  const isLoading = analyticsLoading;
  const hasError = !!analyticsError;

  // When there's an error loading events
  if (eventsError) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            View insights and performance metrics for your events
          </p>
        </div>
        
        <EmptyState
          icon={AlertTriangle}
          title="Error Loading Events"
          description="We couldn't load your events. Please try again later."
          actionLabel="Reload Page"
          actionOnClick={() => window.location.reload()}
          iconClassName="text-red-500"
        />
      </div>
    );
  }

  // When no events found, show empty state
  if (!eventsLoading && !hasEvents) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            View insights and performance metrics for your events
          </p>
        </div>
        
        <EmptyState
          icon={BarChart2}
          title="No Events Found"
          description="You don't have any events yet. Create an event to view its analytics."
          actionLabel="Create Event"
          actionHref="/events/new"
          secondaryActionLabel="View Events"
          secondaryActionHref="/events"
          iconClassName="text-[hsl(var(--eventra-blue))]"
        />
      </div>
    );
  }

  // When events exist but none selected, show empty state asking to select
  if (!eventsLoading && hasEvents && !hasSelectedEvent) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            View insights and performance metrics for your events
          </p>
        </div>
        
        <div className="flex items-center mb-6 space-x-4">
          <Select
            value={selectedEvent}
            onValueChange={setSelectedEvent}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <EmptyState
          icon={BarChart2}
          title="No Event Selected"
          description="Please select an event from the dropdown above to view its analytics."
          iconClassName="text-[hsl(var(--eventra-blue))]"
        />
      </div>
    );
  }

  // When there's an error loading analytics data
  if (hasError) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            View insights and performance metrics for your events
          </p>
        </div>
        
        <div className="flex items-center mb-6 space-x-4">
          <Select
            value={selectedEvent}
            onValueChange={setSelectedEvent}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <EmptyState
          icon={AlertTriangle}
          title="Error Loading Analytics"
          description="We couldn't load analytics data for this event. Please try again later."
          actionLabel="Try Again"
          actionOnClick={() => window.location.reload()}
          iconClassName="text-red-500"
        />
      </div>
    );
  }

  // Show loading state while fetching analytics
  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            View insights and performance metrics for your events
          </p>
        </div>
        
        <div className="flex items-center mb-6 space-x-4">
          <Select
            value={selectedEvent}
            onValueChange={setSelectedEvent}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              {timeframeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--eventra-blue))] mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Analytics dashboard content for when data is loaded
  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          View insights and performance metrics for your events
        </p>
      </div>
      
      <div className="flex items-center mb-6 space-x-4">
        <Select
          value={selectedEvent}
          onValueChange={setSelectedEvent}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={selectedTimeframe}
          onValueChange={setSelectedTimeframe}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            {timeframeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Analytics dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{analyticsData?.totalRegistrations || 0}</div>
              <span className="ml-2 text-xs text-green-500">
                {analyticsData?.registrationsChange && analyticsData.registrationsChange > 0 ? '+' : ''}
                {analyticsData?.registrationsChange || 0}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{analyticsData?.attendance || 0}</div>
              <span className="ml-2 text-xs">{analyticsData?.attendanceRate || 0}%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Feedback Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{analyticsData?.feedback || 0}<span className="text-sm">/5</span></div>
              <span className="ml-2 text-xs text-green-500">
                {analyticsData?.feedbackChange && analyticsData.feedbackChange > 0 ? '+' : ''}
                {analyticsData?.feedbackChange || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">${analyticsData?.revenue || 0}</div>
              <span className="ml-2 text-xs text-green-500">
                {analyticsData?.revenueChange && analyticsData.revenueChange > 0 ? '+' : ''}
                {analyticsData?.revenueChange || 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed charts and analytics for this event will be implemented in a future update.
          </p>
          <div className="mt-4 h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
            <BarChart2 className="h-16 w-16 text-muted-foreground opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}