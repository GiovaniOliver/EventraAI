import { useQuery } from "@tanstack/react-query";
import { ChevronRight, PartyPopper, Cake } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { Event } from "@shared/schema";

const UpcomingEvents = () => {
  const [userId] = useState(1); // For demo, hardcode userId to 1
  
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: [`/api/users/${userId}/events`]
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
        return { icon: <Cake className="h-5 w-5" />, bgColor: 'bg-secondary-100', textColor: 'text-secondary-500' };
      default:
        return { icon: <PartyPopper className="h-5 w-5" />, bgColor: 'bg-primary-100', textColor: 'text-primary-500' };
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
          <Link href="/events" className="text-primary-500 text-sm font-medium">View all</Link>
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
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
            </div>
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
          <Link href="/events" className="text-primary-500 text-sm font-medium">View all</Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-red-500">Error loading events. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-lg">Upcoming Events</h3>
        <Link href="/events" className="text-primary-500 text-sm font-medium">View all</Link>
      </div>
      
      <div className="space-y-4">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(event => {
            const { icon, bgColor, textColor } = getEventIcon(event.type);
            const progress = calculateProgress(event.id);
            const formatString = event.format.charAt(0).toUpperCase() + event.format.slice(1);
            
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center p-4 border-b border-gray-100">
                  <div className={`${bgColor} ${textColor} rounded-lg p-2 mr-3`}>
                    {icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{event.name}</h4>
                    <p className="text-sm text-gray-500">{formatString} • {formatEventDate(event.date)}</p>
                  </div>
                  <div className="ml-auto">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{progress.completed}/{progress.total} tasks completed</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${event.type === 'birthday' ? 'bg-secondary-500' : 'bg-primary-500'} h-2 rounded-full`} 
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-500 mb-4">No upcoming events</p>
            <Link 
              href="/events"
              className="text-primary-500 font-medium hover:text-primary-600"
            >
              Create your first event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;
