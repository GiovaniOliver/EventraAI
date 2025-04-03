'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { 
  CalendarCheck, 
  CheckSquare, 
  BarChart, 
  Sparkles, 
  PlusCircle, 
  ChevronRight,
  Loader2,
  Bell,
  Clock,
  Zap,
  Star,
  Calendar,
  BellRing,
  Coffee,
  Plus
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import PlanningWizard from "@/components/events/planning-wizard"
import NewEventModal from "@/components/modals/new-event-modal"
import { LucideIcon } from "lucide-react"
import { createElement } from "react"

// Define interface for useAuth return type to fix TypeScript error
interface AuthReturn {
  user: any; // or a more specific type if available
  isLoading: boolean;
  login?: (email: string, password: string) => Promise<any>;
  logout?: () => Promise<void>;
  register?: (email: string, password: string, username: string, displayName: string) => Promise<any>;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color?: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  progress: number;
}

// Circular progress component
function CircularProgress({ 
  value, 
  size = 40, 
  strokeWidth = 4, 
  color = "var(--eventra-blue)"
}: { 
  value: number; 
  size?: number; 
  strokeWidth?: number; 
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#e6e6e6"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - dash}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium" style={{ color }}>
        {value}%
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth() as unknown as AuthReturn
  const { toast } = useToast()
  const [greeting, setGreeting] = useState("Welcome")
  const [firstName, setFirstName] = useState("")
  const [isPlanningWizardOpen, setIsPlanningWizardOpen] = useState(false)
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false)
  
  // Set greeting based on time of day
  useEffect(() => {
    const hours = new Date().getHours()
    
    if (hours < 12) {
      setGreeting("Good morning")
    } else if (hours < 18) {
      setGreeting("Good afternoon")
    } else {
      setGreeting("Good evening")
    }
  }, [])
  
  // Get user's first name
  useEffect(() => {
    if (user) {
      try {
        // Try to get display name from user object
        let displayName = '';
        
        if (user.displayName) {
          displayName = user.displayName;
        } else if (user.user_metadata?.full_name) {
          displayName = user.user_metadata.full_name;
        } else if (user.user_metadata?.name) {
          displayName = user.user_metadata.name;
        } else if (user.display_name) {
          displayName = user.display_name;
        } else if (user.email) {
          // As a fallback, use the part of email before @
          displayName = user.email.split('@')[0];
        } else {
          displayName = 'there';
        }
        
        // Extract first name
        const names = displayName.split(' ');
        setFirstName(names[0]);
        
        console.log('[DEBUG] User profile loaded, display name:', displayName);
      } catch (error) {
        console.error('[DEBUG] Error extracting user name:', error);
        setFirstName('there');
      }
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Fetch upcoming events
  const { data: upcomingEvents = [], isLoading: loadingEvents, error: eventsError } = useQuery<UpcomingEvent[]>({
    queryKey: ['upcomingEvents', user?.id],
    queryFn: async () => {
      try {
        // Only proceed if user is authenticated
        if (!user) {
          console.log('[DEBUG] User not authenticated, deferring events fetch');
          return [];
        }

        console.log('[DEBUG] Fetching events for user:', user.id);
        
        try {
          // Get the current session to include auth token
          const supabase = createBrowserSupabaseClient();
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('[DEBUG] Session retrieval error:', sessionError);
            throw new Error('Failed to retrieve session');
          }
          
          if (!session) {
            console.error('[DEBUG] No active session found, cannot fetch events');
            throw new Error('No active session');
          }
          
          // Add authorization headers consistently with other API requests
          const accessToken = session.access_token;
          console.log('[DEBUG] Fetching events with token:', accessToken ? 'Token present' : 'No token');
          
          const response = await fetch('/api/events?status=upcoming&limit=3', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            credentials: 'include'
          });
          
          // Log detailed response information
          console.log('[DEBUG] Events API response status:', response.status);
          
          if (!response.ok) {
            // Get detailed error message
            let errorText = '';
            try {
              const errorData = await response.json();
              errorText = typeof errorData === 'object' ? JSON.stringify(errorData) : String(errorData);
            } catch (e) {
              errorText = await response.text();
            }
            
            console.error('[DEBUG] API response error:', response.status, errorText);
            
            if (response.status === 401) {
              // Try to refresh the session
              console.log('[DEBUG] Auth error detected, attempting to refresh session');
              
              try {
                // Get the current session again
                const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) {
                  console.error('[DEBUG] Session retrieval error:', sessionError);
                  throw new Error('Failed to retrieve session');
                }
                
                if (currentSession) {
                  console.log('[DEBUG] Session found, retrying request with current token');
                  
                  // Retry the request with the current token
                  const retryResponse = await fetch('/api/events?status=upcoming&limit=3', {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${currentSession.access_token}`
                    },
                    credentials: 'include'
                  });
                  
                  if (retryResponse.ok) {
                    const data = await retryResponse.json();
                    
                    // Check if events property exists and is an array
                    if (!data.events || !Array.isArray(data.events)) {
                      console.error('[DEBUG] API response does not contain events array:', data);
                      return [];
                    }
                    
                    // Transform API response to match the UpcomingEvent format
                    return data.events.map((event: any) => ({
                      id: event.id,
                      title: event.title || event.name,
                      date: new Date(event.start_date || event.date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }),
                      time: new Date(event.start_date || event.date).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      }),
                      type: event.type || 'Event',
                      progress: event.progress || Math.floor(Math.random() * 75) + 10 // Random progress if not provided
                    }));
                  } else {
                    console.error('[DEBUG] Retry request failed:', retryResponse.status);
                  }
                }
              } catch (refreshException) {
                console.error('[DEBUG] Error during session refresh:', refreshException);
                // Redirect to login if we can't refresh the session
                router.push('/login');
                throw new Error('Session expired. Please log in again.');
              }
            }
            
            throw new Error(`Error fetching upcoming events: ${response.statusText}. Details: ${errorText}`);
          }
          
          const data = await response.json();
          
          // Check if events property exists and is an array
          if (!data.events || !Array.isArray(data.events)) {
            console.error('[DEBUG] API response does not contain events array:', data);
            return [];
          }
          
          // Transform API response to match the UpcomingEvent format
          return data.events.map((event: any) => ({
            id: event.id,
            title: event.title || event.name,
            date: new Date(event.start_date || event.date).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            time: new Date(event.start_date || event.date).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }),
            type: event.type || 'Event',
            progress: event.progress || Math.floor(Math.random() * 75) + 10 // Random progress if not provided
          }));
        } catch (fetchError) {
          console.error('[DEBUG] Fetch operation error:', fetchError);
          // Use mock data for development/testing if fetch fails
          if (process.env.NODE_ENV === 'development') {
            console.log('[DEBUG] Using mock data in development mode due to fetch error');
            return mockUpcomingEvents();
          }
          throw fetchError;
        }
      } catch (error) {
        console.error('[DEBUG] Failed to fetch upcoming events:', error);
        return [];
      }
    },
    enabled: !!user && !authLoading,
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
  });

  // Mock data function for development
  function mockUpcomingEvents(): UpcomingEvent[] {
    return [
      {
        id: "mock1",
        title: "Sample Conference",
        date: "October 15, 2023",
        time: "9:00 AM",
        type: "Conference",
        progress: 75
      },
      {
        id: "mock2",
        title: "Team Building Workshop",
        date: "November 5, 2023",
        time: "2:00 PM",
        type: "Workshop",
        progress: 45
      }
    ];
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--eventra-blue))] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'create-event',
      title: 'Create Event',
      description: 'Start planning a new event',
      href: '/events/new',
      icon: PlusCircle,
      color: 'bg-green-500/10 text-green-500'
    },
    {
      id: 'visualize-venue',
      title: 'Visualize Venue',
      description: 'Generate themed venue visualizations',
      href: '/venue-visualization',
      icon: Sparkles,
      color: 'bg-purple-500/10 text-purple-500'
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'View your event schedule',
      href: '/calendar',
      icon: Calendar,
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      id: 'tasks',
      title: 'Tasks',
      description: 'Manage your event tasks',
      href: '/tasks',
      icon: CheckSquare,
      color: 'bg-orange-500/10 text-orange-500'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View event performance',
      href: '/analytics',
      icon: BarChart,
      color: 'bg-teal-500/10 text-teal-500'
    }
  ]

  const handleActionClick = (href: string) => {
    if (href === '/events/new') {
      setIsNewEventModalOpen(true)
    } else {
      router.push(href)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      {/* Dashboard header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          {greeting}, {firstName || 'there'} 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your events
        </p>
      </div>

      {/* Wizard button - new addition */}
      <div className="mb-10">
        <Button 
          className="bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all" 
          size="lg"
          onClick={() => setIsPlanningWizardOpen(true)}
        >
          <Zap className="mr-2 h-5 w-5" />
          <span>Event Wizard</span>
        </Button>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => handleActionClick(action.href)}
              className={cn(
                "group relative rounded-lg p-3 hover:shadow-md transition-all duration-200",
                "bg-gradient-to-br from-background to-muted/60 border border-border/50 hover:border-[hsl(var(--eventra-blue))/30]"
              )}
            >
              <div className="flex flex-col items-start gap-2">
                <span className={cn(
                  "inline-flex items-center justify-center p-2 rounded-md",
                  action.color || "bg-muted"
                )}>
                  {createElement(action.icon, { className: "h-4 w-4" })}
                </span>
                <div>
                  <h3 className="text-sm font-medium">{action.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Upcoming Events</h2>
          <Button variant="ghost" size="sm" className="text-[hsl(var(--eventra-blue))] view-all" asChild>
            <Link href="/events">
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loadingEvents ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--eventra-blue))]" />
          </div>
        ) : !upcomingEvents || upcomingEvents.length === 0 ? (
          <Card className="p-8 text-center border-dashed shadow-sm transition-all duration-300 overflow-hidden relative"
            style={{
              background: "linear-gradient(135deg, rgba(var(--eventra-teal-rgb), 0.05), rgba(var(--eventra-blue-rgb), 0.07), rgba(var(--eventra-purple-rgb), 0.05))",
              border: "1px solid rgba(var(--eventra-blue-rgb), 0.1)"
            }}
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-5 right-5 w-24 h-24 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl"></div>
              <div className="absolute bottom-5 left-5 w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/10 to-teal-500/10 blur-xl"></div>
            </div>
            
            {/* Icon Container */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] p-[2px]">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <Calendar className="h-8 w-8 text-[hsl(var(--eventra-blue))]" />
              </div>
            </div>
            
            {/* Content */}
            <h3 className="text-xl font-semibold mb-2 text-foreground">No Upcoming Events</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your dashboard will show your next events here. Get started by creating your first event to manage planning, tasks, and invitations.
            </p>
            
            {/* Action Button */}
            <Button 
              onClick={() => setIsNewEventModalOpen(true)}
              className="bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] text-white shadow-md hover:shadow-lg transition-all duration-300 gap-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create an Event
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.map(event => (
              <div key={event.id} className="rounded-lg p-4 hover:shadow-md transition-shadow duration-200" style={{
                background: "linear-gradient(135deg, rgba(var(--eventra-teal-rgb), 0.05), rgba(var(--eventra-blue-rgb), 0.07), rgba(var(--eventra-purple-rgb), 0.05))",
                border: "1px solid rgba(var(--eventra-blue-rgb), 0.1)"
              }}>
                <Link href={`/events/${event.id}`} className="flex justify-between h-full">
                  <div className="flex-grow pr-4">
                    <h3 className="font-medium mb-1 text-foreground">{event.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      {event.date} • {event.time}
                    </div>
                    <div className="text-xs inline-block px-2 py-0.5 rounded-full" style={{
                      background: "linear-gradient(135deg, hsl(var(--eventra-teal)), hsl(var(--eventra-blue)))",
                      color: "white"
                    }}>
                      {event.type}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CircularProgress 
                      value={event.progress} 
                      color={`hsl(var(--eventra-${event.progress > 60 ? 'blue' : event.progress > 30 ? 'teal' : 'purple'}))`}
                    />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Stats - we can add this section later if needed */}

      {/* Add Planning Wizard Modal */}
      <PlanningWizard
        isOpen={isPlanningWizardOpen}
        onClose={() => setIsPlanningWizardOpen(false)}
      />

      {/* Add New Event Modal */}
      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
      />
    </div>
  )
}