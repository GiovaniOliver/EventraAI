'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
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
  Coffee
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import PlanningWizard from "@/components/events/planning-wizard"
import NewEventModal from "@/components/modals/new-event-modal"

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
  icon: React.ReactNode;
  href: string;
  color: string;
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
  const { user, isLoading } = useAuth() as unknown as AuthReturn
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
    if (user && user.displayName) {
      const names = user.displayName.split(' ')
      setFirstName(names[0])
    }
  }, [user])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Fetch upcoming events
  const { data: upcomingEvents = [], isLoading: loadingEvents } = useQuery<UpcomingEvent[]>({
    queryKey: ['upcomingEvents'],
    queryFn: async () => {
      // Only use mock data if explicitly in development mode with the NEXT_PUBLIC_USE_MOCK_DATA flag
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return [
          {
            id: '1',
            title: 'Annual Tech Conference',
            date: 'May 15, 2025',
            time: '9:00 AM',
            type: 'Conference',
            progress: 45
          },
          {
            id: '2',
            title: 'Product Training Workshop',
            date: 'April 20, 2025',
            time: '1:00 PM',
            type: 'Workshop',
            progress: 65
          },
          {
            id: '3',
            title: 'Team Building Retreat',
            date: 'June 5, 2025',
            time: '10:00 AM',
            type: 'Team Event',
            progress: 25
          }
        ];
      }
      
      try {
        const response = await fetch('/api/events?status=upcoming&limit=3', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching upcoming events: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Check if events property exists and is an array
        if (!data.events || !Array.isArray(data.events)) {
          console.error('API response does not contain events array:', data);
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
      } catch (error) {
        console.error('Failed to fetch upcoming events:', error);
        return []; // Return empty array instead of throwing
      }
    },
    enabled: !!user // Only run the query if user is authenticated
  });

  if (isLoading) {
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
      icon: <PlusCircle className="h-5 w-5" />,
      href: '/events/new',
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      id: 'schedule',
      title: 'Your Schedule',
      description: 'View upcoming events',
      icon: <Calendar className="h-5 w-5" />,
      href: '/events',
      color: 'bg-amber-500/10 text-amber-500'
    },
    {
      id: 'ideas',
      title: 'Get Ideas',
      description: 'Find inspiration for events',
      icon: <Sparkles className="h-5 w-5" />,
      href: '/discover',
      color: 'bg-purple-500/10 text-purple-500'
    },
    {
      id: 'reminders',
      title: 'Reminders',
      description: 'Check your tasks and notifications',
      icon: <BellRing className="h-5 w-5" />,
      href: '/tasks',
      color: 'bg-pink-500/10 text-pink-500'
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

      {/* Quick actions */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
          <Button variant="ghost" size="sm" className="text-[hsl(var(--eventra-blue))] view-all" asChild>
            <Link href="/dashboard/actions">
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map(action => (
            <div key={action.id} 
              className="p-4 hover:shadow-md transition-shadow duration-200 action-card rounded-lg overflow-hidden" 
              style={{
                background: "linear-gradient(135deg, rgba(var(--eventra-teal-rgb), 0.05), rgba(var(--eventra-blue-rgb), 0.07), rgba(var(--eventra-purple-rgb), 0.05))",
                border: "1px solid rgba(var(--eventra-blue-rgb), 0.1)"
              }}
            >
              <Link href={action.href} className="flex flex-col h-full">
                <div className="p-2 rounded-full w-fit mb-3 card-icon" 
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--eventra-teal)), hsl(var(--eventra-blue)))",
                    color: "white"
                  }}>
                  {action.icon}
                </div>
                <h3 className="font-medium mb-1 text-foreground">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </Link>
            </div>
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
          <div className="rounded-lg p-8 text-center empty-state" style={{
            background: "linear-gradient(135deg, rgba(var(--eventra-teal-rgb), 0.05), rgba(var(--eventra-blue-rgb), 0.07), rgba(var(--eventra-purple-rgb), 0.05))",
            border: "1px solid rgba(var(--eventra-blue-rgb), 0.1)"
          }}>
            <Calendar className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--eventra-blue))]" />
            <h3 className="text-lg font-medium mb-2 text-foreground">No upcoming events</h3>
            <p className="text-muted-foreground mb-6">Start creating events to see them here</p>
            <Button asChild className="bg-gradient-to-r from-[hsl(var(--eventra-teal))] via-[hsl(var(--eventra-blue))] to-[hsl(var(--eventra-purple))] text-white">
              <Link href="/events/new">Create an Event</Link>
            </Button>
          </div>
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