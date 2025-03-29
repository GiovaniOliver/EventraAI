"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarCheck, Plus, BarChart, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function BottomNavigation() {
  const pathname = usePathname();
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  useEffect(() => {
    // Track scroll direction to hide bottom nav when scrolling down
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Show when scrolling up or at the bottom of the page
      setIsAtBottom(currentScrollY <= 20 || 
                   currentScrollY < lastScrollY ||
                   window.innerHeight + currentScrollY >= document.body.offsetHeight - 100);
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path === '/events' && (pathname === '/events' || pathname.startsWith('/events/'))) return true;
    if (path === '/discover' && pathname === '/discover') return true;
    if (path === '/analytics' && pathname === '/analytics') return true;
    return false;
  };
  
  return (
    <nav className={cn(
      "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 h-16 px-6 rounded-full transition-transform duration-300 shadow-xl bg-white/90 backdrop-blur-md border border-white/20",
      isAtBottom ? "translate-y-0" : "translate-y-full",
      "w-[90%] max-w-md"
    )}>
      <div className="flex h-full items-center justify-around relative">
        <Link 
          href="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center w-1/5 h-full",
            isActive('/dashboard') 
              ? "text-[hsl(var(--eventra-blue))]" 
              : "text-muted-foreground"
          )}
        >
          <Home size={22} />
          <span className="text-xs mt-1 font-medium">Home</span>
        </Link>
        
        <Link 
          href="/events"
          className={cn(
            "flex flex-col items-center justify-center w-1/5 h-full",
            isActive('/events') 
              ? "text-[hsl(var(--eventra-blue))]" 
              : "text-muted-foreground"
          )}
        >
          <CalendarCheck size={22} />
          <span className="text-xs mt-1 font-medium">Events</span>
        </Link>
        
        <div className="w-1/5 flex justify-center">
          <Link 
            href="/events/new"
            className="absolute -top-5 flex items-center justify-center"
          >
            <div className="rounded-full p-4 shadow-lg" style={{
              background: "linear-gradient(135deg, hsl(174, 42%, 45%) 0%, hsl(210, 69%, 58%) 50%, hsl(263, 58%, 61%) 100%)"
            }}>
              <Plus size={22} className="text-white" />
            </div>
          </Link>
        </div>
        
        <Link 
          href="/discover"
          className={cn(
            "flex flex-col items-center justify-center w-1/5 h-full",
            isActive('/discover') 
              ? "text-[hsl(var(--eventra-blue))]" 
              : "text-muted-foreground"
          )}
        >
          <Sparkles size={22} />
          <span className="text-xs mt-1 font-medium">Discover</span>
        </Link>
        
        <Link 
          href="/analytics"
          className={cn(
            "flex flex-col items-center justify-center w-1/5 h-full",
            isActive('/analytics') 
              ? "text-[hsl(var(--eventra-blue))]" 
              : "text-muted-foreground"
          )}
        >
          <BarChart size={22} />
          <span className="text-xs mt-1 font-medium">Analytics</span>
        </Link>
      </div>
    </nav>
  );
}
