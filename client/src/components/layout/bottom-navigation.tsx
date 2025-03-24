import { Link } from "wouter";
import { Home, CalendarCheck, Plus, CheckCircle, User, Sparkles } from "lucide-react";
import { useState } from "react";
import NewEventModal from "@/components/modals/new-event-modal";

interface BottomNavigationProps {
  currentPath: string;
}

export default function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  
  const isActive = (path: string) => currentPath === path;
  
  return (
    <>
      <nav className="bg-white shadow-lg fixed bottom-0 left-0 right-0 z-10 h-20">
        <div className="flex justify-between items-center h-full px-2">
          <Link 
            href="/"
            className={`flex flex-col items-center justify-center space-y-1 w-1/6 h-full ${isActive('/') ? 'text-primary-500' : 'text-gray-400 hover:text-primary-500'}`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          
          <Link 
            href="/events"
            className={`flex flex-col items-center justify-center space-y-1 w-1/6 h-full ${isActive('/events') ? 'text-primary-500' : 'text-gray-400 hover:text-primary-500'}`}
          >
            <CalendarCheck className="h-5 w-5" />
            <span className="text-xs font-medium">Events</span>
          </Link>
          
          <Link 
            href="/discover"
            className={`flex flex-col items-center justify-center space-y-1 w-1/6 h-full ${isActive('/discover') ? 'text-primary-500' : 'text-gray-400 hover:text-primary-500'}`}
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-medium">Discover</span>
          </Link>
          
          <button 
            onClick={() => setShowNewEventModal(true)}
            className="flex flex-col items-center justify-center space-y-1 w-1/6 h-full text-gray-400 hover:text-primary-500"
          >
            <div className="bg-primary-500 rounded-full p-3 -mt-6 shadow-md">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium mt-1">Create</span>
          </button>
          
          <Link 
            href="/tasks"
            className={`flex flex-col items-center justify-center space-y-1 w-1/6 h-full ${isActive('/tasks') ? 'text-primary-500' : 'text-gray-400 hover:text-primary-500'}`}
          >
            <CheckCircle className="h-5 w-5" />
            <span className="text-xs font-medium">Tasks</span>
          </Link>
          
          <Link 
            href="/profile"
            className={`flex flex-col items-center justify-center space-y-1 w-1/6 h-full ${isActive('/profile') ? 'text-primary-500' : 'text-gray-400 hover:text-primary-500'}`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Profile</span>
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
