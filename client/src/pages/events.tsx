import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
  Users,
  Sparkles,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Event } from "@shared/schema";
import { format } from "date-fns";
import NewEventModal from "@/components/modals/new-event-modal";
import PlanningWizard from "@/components/events/planning-wizard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function Events() {
  // All hooks must be called at the top level
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showPlanningWizard, setShowPlanningWizard] = useState(false);
  const [userId] = useState(1); // For demo, hardcode userId to 1
  const [, navigate] = useLocation();
  
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: [`/api/users/${userId}/events`]
  });
  
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [draftEvents, setDraftEvents] = useState<Event[]>([]);
  
  // Navigate to event detail
  const handleEventClick = useCallback((eventId: number) => {
    navigate(`/events/${eventId}`);
  }, [navigate]);
  
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
  
  // Modal controls
  const openNewEventModal = useCallback(() => {
    setShowNewEventModal(true);
  }, []);
  
  const closeNewEventModal = useCallback(() => {
    setShowNewEventModal(false);
  }, []);
  
  const openPlanningWizard = useCallback(() => {
    setShowPlanningWizard(true);
  }, []);
  
  const closePlanningWizard = useCallback(() => {
    setShowPlanningWizard(false);
  }, []);
  
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

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Events</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="font-medium">
              <Plus className="h-4 w-4 mr-1" /> 
              New Event
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={openNewEventModal}>
              Quick Create
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openPlanningWizard} className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Use Planning Wizard</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Tabs defaultValue="upcoming">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
          <TabsTrigger value="drafts" className="flex-1">Drafts</TabsTrigger>
          <TabsTrigger value="past" className="flex-1">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {isLoading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, i) => (
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
            ))
          ) : error ? (
            <div className="text-center py-6 text-red-500">
              Error loading events. Please try again.
            </div>
          ) : upcomingEvents.length === 0 ? (
            // Empty state
            <div className="text-center py-10">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No upcoming events found</p>
              <Button onClick={openNewEventModal}>
                Create Event
              </Button>
            </div>
          ) : (
            // Event list
            upcomingEvents.map((event) => {
              const { bg, text } = getEventIconStyles(event.type);
              const formattedDate = format(new Date(event.date), 'MMMM d, yyyy');
              const formattedTime = format(new Date(event.date), 'h:mm a');
              
              return (
                <Card 
                  key={event.id} 
                  className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleEventClick(event.id)}
                >
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
            })
          )}
        </TabsContent>
        
        <TabsContent value="drafts">
          {isLoading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, i) => (
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
            ))
          ) : error ? (
            <div className="text-center py-6 text-red-500">
              Error loading drafts. Please try again.
            </div>
          ) : draftEvents.length === 0 ? (
            // Empty state
            <div className="text-center py-10">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No draft events found</p>
              <Button onClick={openNewEventModal}>
                Create Event
              </Button>
            </div>
          ) : (
            // Draft events list
            draftEvents.map((event) => {
              const { bg, text } = getEventIconStyles(event.type);
              const formattedDate = format(new Date(event.date), 'MMMM d, yyyy');
              const formattedTime = format(new Date(event.date), 'h:mm a');
              
              return (
                <Card 
                  key={event.id} 
                  className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleEventClick(event.id)}
                >
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
            })
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {isLoading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, i) => (
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
            ))
          ) : error ? (
            <div className="text-center py-6 text-red-500">
              Error loading past events. Please try again.
            </div>
          ) : pastEvents.length === 0 ? (
            // Empty state
            <div className="text-center py-10">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No past events found</p>
              <Button onClick={openNewEventModal}>
                Create Event
              </Button>
            </div>
          ) : (
            // Past events list
            pastEvents.map((event) => {
              const { bg, text } = getEventIconStyles(event.type);
              const formattedDate = format(new Date(event.date), 'MMMM d, yyyy');
              const formattedTime = format(new Date(event.date), 'h:mm a');
              
              return (
                <Card 
                  key={event.id} 
                  className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleEventClick(event.id)}
                >
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
            })
          )}
        </TabsContent>
      </Tabs>
      
      <NewEventModal 
        isOpen={showNewEventModal} 
        onClose={closeNewEventModal} 
      />
      
      <PlanningWizard
        isOpen={showPlanningWizard}
        onClose={closePlanningWizard}
      />
    </div>
  );
}
