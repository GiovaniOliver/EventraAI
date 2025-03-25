import { Link } from "wouter";
import { Home, CalendarCheck, Plus, User, Sparkles, BarChart } from "lucide-react";
import { useState } from "react";
import NewEventModal from "@/components/modals/new-event-modal";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  currentPath: string;
}

export default function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  
  const isActive = (path: string) => currentPath === path;
  
  return (
    <>
      <nav className="bg-background border-t fixed bottom-0 left-0 right-0 z-10 h-16">
        <div className="flex justify-around items-center h-full">
          <Link 
            href="/dashboard"
            className={cn(
              "flex flex-col items-center justify-center w-1/5 h-full transition-colors",
              isActive('/dashboard') 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium mt-1">Home</span>
          </Link>
          
          <Link 
            href="/events"
            className={cn(
              "flex flex-col items-center justify-center w-1/5 h-full transition-colors",
              isActive('/events') 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CalendarCheck className="h-5 w-5" />
            <span className="text-xs font-medium mt-1">Events</span>
          </Link>
          
          <button 
            onClick={() => setShowNewEventModal(true)}
            className="flex flex-col items-center justify-center w-1/5 h-full"
            aria-label="Create new event"
          >
            <div className="bg-primary text-primary-foreground rounded-full p-3 -mt-6 shadow-md hover:brightness-110 transition-all">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium mt-3 text-muted-foreground">Create</span>
          </button>
          
          <Link 
            href="/discover"
            className={cn(
              "flex flex-col items-center justify-center w-1/5 h-full transition-colors",
              isActive('/discover') 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-medium mt-1">Discover</span>
          </Link>
          
          <Link 
            href="/analytics"
            className={cn(
              "flex flex-col items-center justify-center w-1/5 h-full transition-colors",
              isActive('/analytics') 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BarChart className="h-5 w-5" />
            <span className="text-xs font-medium mt-1">Analytics</span>
          </Link>
        </div>
      </nav>
      
      <NewEventModal 
        isOpen={showNewEventModal} 
        onClose={() => setShowNewEventModal(false)} 
      />
    </>
  );
}
