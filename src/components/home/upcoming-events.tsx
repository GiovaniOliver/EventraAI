"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, PartyPopper, Cake } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";

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
  // Mock user ID for demo purposes
  const [userId] = useState(1);
  
  // In a real app, this would fetch events from an API
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: [`/api/users/${userId}/events`],
    queryFn: async () => {
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
    switch (type) {
      case 'birthday':
        return { icon: <Cake className="h-5 w-5" />, bgColor: 'bg-secondary/20', textColor: 'text-secondary' };
      default:
        return { icon: <PartyPopper className="h-5 w-5" />, bgColor: 'bg-primary/20', textColor: 'text-primary' };
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

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-lg">Upcoming Events</h3>
          <Link href="/events" className="text-primary text-sm font-medium">
            View all
          </Link>
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Card key={i} className="overflow-hidden">
              <div className="p-4 border-b border-border">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="p-4">
                <div className="flex justify-between text-sm mb-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-lg">Upcoming Events</h3>
          <Link href="/events" className="text-primary text-sm font-medium">
            View all
          </Link>
        </div>
        <Card className="p-4">
          <p className="text-destructive">Error loading events. Please try again.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-lg">Upcoming Events</h3>
        <Link href="/events" className="text-primary text-sm font-medium">
          View all
        </Link>
      </div>
      
      <div className="space-y-4">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(event => {
            const { icon, bgColor, textColor } = getEventIcon(event.type);
            const progress = calculateProgress(event.id);
            const formatString = event.format.charAt(0).toUpperCase() + event.format.slice(1);
            
            return (
              <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <Link href={`/events/${event.id}`} className="block">
                  <div className="flex items-center p-4 border-b border-border">
                    <div className={`${bgColor} ${textColor} rounded-lg p-2 mr-3`}>
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{event.name}</h4>
                      <p className="text-sm text-muted-foreground">{formatString} • {formatEventDate(event.date)}</p>
                    </div>
                    <div className="ml-auto">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress.completed}/{progress.total} tasks completed</span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                  </div>
                </Link>
              </Card>
            );
          })
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No upcoming events</p>
            <Link 
              href="/events/new"
              className="text-primary font-medium hover:text-primary/80"
            >
              Create your first event
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;
