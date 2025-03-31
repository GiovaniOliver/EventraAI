"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  PartyPopper, 
  Cake, 
  Calendar, 
  Timer, 
  Users, 
  PlusCircle,
  Check,
  Clock,
  AlertTriangle,
  CalendarDays,
  ArrowUpRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { cn } from "@/lib/utils";

// Define the Event type
interface Event {
  id: number;
  name: string;
  type: string;
  format: string; 
  date: string;
  status: string;
}

const UpcomingEvents = () => {
  // Get the current user ID
  const { user } = useAuth();
  
  // Fetch upcoming events from API
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: [`/api/events`],
    queryFn: async () => {
      // Only use mock data if explicitly in development mode with the NEXT_PUBLIC_USE_MOCK_DATA flag
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration purposes
        return [
          {
            id: 1,
            name: "Annual Tech Conference",
            type: "conference",
            format: "hybrid",
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
            status: "planning"
          },
          {
            id: 2,
            name: "Team Building Workshop",
            type: "workshop",
            format: "in-person",
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
            status: "planning"
          },
          {
            id: 3,
            name: "Product Launch Webinar",
            type: "webinar",
            format: "virtual",
            date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks from now
            status: "planning"
          }
        ];
      }
      
      try {
        const response = await fetch('/api/events?status=upcoming&limit=3', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching upcoming events: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.events;
      } catch (error) {
        console.error('Failed to fetch upcoming events:', error);
        throw error;
      }
    },
    staleTime: 60 * 1000 // 1 minute
  });
  
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  
  // Filter for upcoming events only
  useEffect(() => {
    if (events) {
      const now = new Date();
      const filtered = events
        .filter(event => new Date(event.date) > now && event.status !== 'cancelled')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3); // Show only next 3 events
      
      setUpcomingEvents(filtered);
    }
  }, [events]);
  
  // Helper function to get event icon based on type
  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'birthday':
        return { 
          icon: <Cake className="h-5 w-5" />, 
          bgColor: 'from-pink-600 to-pink-400', 
          textColor: 'text-pink-700 dark:text-pink-300',
          borderColor: 'border-pink-300 dark:border-pink-700',
          lightBgColor: 'bg-pink-50 dark:bg-pink-950',
          progressColor: 'bg-pink-600',
          badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
          hoverColor: 'hover:border-pink-400 dark:hover:border-pink-500'
        };
      case 'conference':
        return { 
          icon: <Users className="h-5 w-5" />, 
          bgColor: 'from-blue-600 to-blue-400', 
          textColor: 'text-blue-700 dark:text-blue-300',
          borderColor: 'border-blue-300 dark:border-blue-700',
          lightBgColor: 'bg-blue-50 dark:bg-blue-950',
          progressColor: 'bg-blue-600',
          badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
          hoverColor: 'hover:border-blue-400 dark:hover:border-blue-500'
        };
      case 'webinar':
        return { 
          icon: <Timer className="h-5 w-5" />, 
          bgColor: 'from-purple-600 to-purple-400', 
          textColor: 'text-purple-700 dark:text-purple-300',
          borderColor: 'border-purple-300 dark:border-purple-700',
          lightBgColor: 'bg-purple-50 dark:bg-purple-950',
          progressColor: 'bg-purple-600',
          badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
          hoverColor: 'hover:border-purple-400 dark:hover:border-purple-500'
        };
      case 'workshop':
        return { 
          icon: <Users className="h-5 w-5" />, 
          bgColor: 'from-amber-600 to-amber-400', 
          textColor: 'text-amber-700 dark:text-amber-300',
          borderColor: 'border-amber-300 dark:border-amber-700',
          lightBgColor: 'bg-amber-50 dark:bg-amber-950',
          progressColor: 'bg-amber-600',
          badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
          hoverColor: 'hover:border-amber-400 dark:hover:border-amber-500'
        };
      default:
        return { 
          icon: <PartyPopper className="h-5 w-5" />, 
          bgColor: 'from-emerald-600 to-emerald-400', 
          textColor: 'text-emerald-700 dark:text-emerald-300',
          borderColor: 'border-emerald-300 dark:border-emerald-700',
          lightBgColor: 'bg-emerald-50 dark:bg-emerald-950',
          progressColor: 'bg-emerald-600',
          badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
          hoverColor: 'hover:border-emerald-400 dark:hover:border-emerald-500'
        };
    }
  };
  
  // Helper function to calculate progress
  const calculateProgress = (eventId: number) => {
    // In a real app, this would fetch tasks and calculate actual progress
    // For demo, use random progress
    const randomCompleted = Math.floor(Math.random() * 10) + 1;
    const randomTotal = randomCompleted + Math.floor(Math.random() * 10) + 5;
    const percentage = (randomCompleted / randomTotal) * 100;
    
    return {
      completed: randomCompleted,
      total: randomTotal,
      percentage
    };
  };
  
  // Format event date
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Get relative time for events (e.g. "in 2 days")
  const getRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Get days remaining until event
  const getDaysRemaining = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(eventDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Determine urgency level based on days remaining
  const getUrgencyLevel = (daysRemaining: number) => {
    if (daysRemaining <= 3) return "high";
    if (daysRemaining <= 14) return "medium";
    return "low";
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Upcoming Events
          </h3>
          <Link href="/events" className="text-primary text-sm font-medium hover:underline flex items-center group px-2 py-1 rounded-md hover:bg-primary/5 transition-colors">
            View all <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Card key={i} className="overflow-hidden border-border shadow-sm">
              <div className="flex p-4 border-b border-border/60">
                <Skeleton className="h-12 w-12 rounded-lg mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24 ml-2 rounded-full" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full mb-4" />
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Upcoming Events
          </h3>
          <Link href="/events" className="text-primary text-sm font-medium hover:underline flex items-center group px-2 py-1 rounded-md hover:bg-primary/5 transition-colors">
            View all <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <Card className="p-6 border-destructive/20 bg-destructive/5 shadow-sm">
          <div className="flex items-start">
            <div className="bg-destructive/10 rounded-full p-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="ml-4">
              <p className="text-destructive font-medium">Error loading events</p>
              <p className="text-destructive/80 text-sm mt-1">We encountered a problem loading your upcoming events. Please try again.</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="mt-4 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Upcoming Events
        </h3>
        <Link 
          href="/events" 
          className="text-primary text-sm font-medium flex items-center group px-2 py-1 rounded-md hover:bg-primary/5 transition-colors"
          aria-label="View all events"
        >
          View all <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      
      <div className="space-y-4">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(event => {
            const { 
              icon, 
              bgColor, 
              textColor, 
              borderColor, 
              lightBgColor, 
              progressColor, 
              badgeColor,
              hoverColor
            } = getEventIcon(event.type);
            const progress = calculateProgress(event.id);
            const formatString = event.format.charAt(0).toUpperCase() + event.format.slice(1);
            const relativeTime = getRelativeTime(event.date);
            const daysRemaining = getDaysRemaining(event.date);
            const urgencyLevel = getUrgencyLevel(daysRemaining);
            
            return (
              <Card 
                key={event.id} 
                className={cn(
                  "overflow-hidden border shadow transition-all duration-300",
                  borderColor,
                  hoverColor,
                  "hover:shadow-md hover:-translate-y-1"
                )}
              >
                <div className="flex items-center p-4 border-b border-border/50">
                  <div className={cn(
                    "rounded-lg p-2.5 mr-3 text-white shadow-sm", 
                    "bg-gradient-to-br",
                    bgColor
                  )}>
                    {icon}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-medium text-foreground truncate" id={`event-${event.id}-title`}>
                      {event.name}
                    </h4>
                    <div className="flex flex-wrap items-center mt-1 gap-2">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs font-normal",
                          badgeColor
                        )}
                      >
                        {formatString}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center whitespace-nowrap">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        {formatEventDate(event.date)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "font-normal whitespace-nowrap",
                        urgencyLevel === "high" ? "text-red-700 border-red-300 bg-red-50 dark:text-red-300 dark:border-red-800 dark:bg-red-950/50" :
                        urgencyLevel === "medium" ? "text-amber-700 border-amber-300 bg-amber-50 dark:text-amber-300 dark:border-amber-800 dark:bg-amber-950/50" :
                        "text-emerald-700 border-emerald-300 bg-emerald-50 dark:text-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/50"
                      )}
                    >
                      <Clock className="h-3 w-3 mr-1" /> {relativeTime}
                    </Badge>
                  </div>
                </div>
                
                <div className={cn("p-4", lightBgColor)}>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-muted-foreground font-medium flex items-center">
                      <Check className="h-4 w-4 mr-1.5" /> {progress.completed} of {progress.total} tasks completed
                    </span>
                    <span className={cn(
                      "text-xs font-medium",
                      textColor
                    )}>
                      {Math.round(progress.percentage)}% complete
                    </span>
                  </div>
                  
                  <Progress 
                    value={progress.percentage} 
                    className={cn(
                      "h-1.5 rounded-full bg-muted/50 mb-4",
                      {
                        "[&>div]:bg-pink-600": progressColor === "bg-pink-600",
                        "[&>div]:bg-blue-600": progressColor === "bg-blue-600",
                        "[&>div]:bg-purple-600": progressColor === "bg-purple-600",
                        "[&>div]:bg-amber-600": progressColor === "bg-amber-600",
                        "[&>div]:bg-emerald-600": progressColor === "bg-emerald-600"
                      }
                    )}
                    aria-label={`Event planning progress: ${Math.round(progress.percentage)}% complete`}
                    aria-describedby={`event-${event.id}-title`}
                  />
                  
                  <div className="flex justify-end">
                    <Link 
                      href={`/events/${event.id}`}
                      aria-label={`View details for ${event.name}`}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "hover:bg-background/80 gap-1",
                          textColor
                        )}
                      >
                        View details <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center border-dashed bg-muted/20 shadow-sm hover:bg-muted/30 transition-colors">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4">
              <PartyPopper className="h-8 w-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium text-foreground mb-2">No upcoming events</h4>
            <p className="text-muted-foreground mb-6">Get started by creating your first event</p>
            <Link 
              href="/events/new"
              aria-label="Create your first event"
            >
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;
