import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  ChevronRight,
  PartyPopper,
  Cake,
  School,
  MoreHorizontal,
  Clock,
  Calendar,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Event } from "@shared/schema";
import { format } from "date-fns";
import NewEventModal from "@/components/modals/new-event-modal";

export default function Events() {
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [userId] = useState(1); // For demo, hardcode userId to 1
  
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: [`/api/users/${userId}/events`]
  });
  
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [draftEvents, setDraftEvents] = useState<Event[]>([]);
  
  // Filter events by status
  useEffect(() => {
    if (events) {
      const now = new Date();
      
      setUpcomingEvents(
        events
          .filter(event => 
            new Date(event.date) > now && 
            event.status !== 'draft' && 
            event.status !== 'cancelled'
          )
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      );
      
      setPastEvents(
        events
          .filter(event => 
            new Date(event.date) < now || 
            event.status === 'completed'
          )
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      
      setDraftEvents(
        events
          .filter(event => event.status === 'draft')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    }
  }, [events]);
  
  // Helper function to get event icon based on type
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return <Cake className="h-5 w-5" />;
      case 'webinar':
        return <School className="h-5 w-5" />;
      case 'other':
        return <MoreHorizontal className="h-5 w-5" />;
      default:
        return <PartyPopper className="h-5 w-5" />;
    }
  };
  
  // Helper function to get event icon color
  const getEventIconStyles = (type: string) => {
    switch (type) {
      case 'birthday':
        return {
          bg: 'bg-secondary-100',
          text: 'text-secondary-500'
        };
      case 'webinar':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-500'
        };
      default:
        return {
          bg: 'bg-primary-100',
          text: 'text-primary-500'
        };
    }
  };
  
  // Render event item
  const renderEventItem = (event: Event) => {
    const { bg, text } = getEventIconStyles(event.type);
    const formattedDate = format(new Date(event.date), 'MMMM d, yyyy');
    const formattedTime = format(new Date(event.date), 'h:mm a');
    
    return (
      <Card key={event.id} className="mb-4">
        <CardContent className="p-0">
          <div className="flex items-center p-4 border-b border-gray-100">
            <div className={`${bg} ${text} rounded-lg p-2 mr-3`}>
              {getEventIcon(event.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{event.name}</h4>
              <p className="text-sm text-gray-500">
                {event.format.charAt(0).toUpperCase() + event.format.slice(1)} • {formattedDate}
              </p>
            </div>
            <div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="p-4 grid grid-cols-3 gap-2">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-2" />
              <span>{formattedTime}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{event.type}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-2" />
              <span>{event.estimatedGuests || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, i) => (
      <Card key={i} className="mb-4">
        <CardContent className="p-0">
          <div className="flex items-center p-4 border-b border-gray-100">
            <Skeleton className="h-10 w-10 rounded-lg mr-3" />
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          
          <div className="p-4 grid grid-cols-3 gap-2">
            {Array(3).fill(0).map((_, j) => (
              <Skeleton key={j} className="h-5 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    ));
  };
  
  // Render empty state
  const renderEmptyState = (message: string) => {
    return (
      <div className="text-center py-10">
        <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">{message}</p>
        <Button onClick={() => setShowNewEventModal(true)}>
          Create Event
        </Button>
      </div>
    );
  };

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Events</h2>
        <Button size="sm" onClick={() => setShowNewEventModal(true)}>New Event</Button>
      </div>
      
      <Tabs defaultValue="upcoming">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
          <TabsTrigger value="drafts" className="flex-1">Drafts</TabsTrigger>
          <TabsTrigger value="past" className="flex-1">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {isLoading ? (
            renderSkeletons()
          ) : error ? (
            <div className="text-center py-6 text-red-500">
              Error loading events. Please try again.
            </div>
          ) : upcomingEvents.length === 0 ? (
            renderEmptyState("No upcoming events found")
          ) : (
            upcomingEvents.map(renderEventItem)
          )}
        </TabsContent>
        
        <TabsContent value="drafts">
          {isLoading ? (
            renderSkeletons()
          ) : error ? (
            <div className="text-center py-6 text-red-500">
              Error loading drafts. Please try again.
            </div>
          ) : draftEvents.length === 0 ? (
            renderEmptyState("No draft events found")
          ) : (
            draftEvents.map(renderEventItem)
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {isLoading ? (
            renderSkeletons()
          ) : error ? (
            <div className="text-center py-6 text-red-500">
              Error loading past events. Please try again.
            </div>
          ) : pastEvents.length === 0 ? (
            renderEmptyState("No past events found")
          ) : (
            pastEvents.map(renderEventItem)
          )}
        </TabsContent>
      </Tabs>
      
      <NewEventModal 
        isOpen={showNewEventModal} 
        onClose={() => setShowNewEventModal(false)} 
      />
    </div>
  );
}
