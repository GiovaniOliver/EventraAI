"use client"

import Header from './header';
import Footer from './footer';
import BottomNavigation from './bottom-navigation';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

type MainLayoutProps = {
  children: React.ReactNode
};

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // List of paths that should show bottom navigation (only for authenticated users)
  const protectedPaths = [
    "/dashboard",
    "/events", 
    "/discover", 
    "/analytics", 
    "/profile", 
    "/settings",
    "/tasks"
  ];
  
  // Check if current path starts with any of the protected paths
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || 
    pathname?.startsWith(`${path}/`)
  );
  
  // Show bottom navigation for authenticated users on all protected paths
  const showBottomNav = !!user && isProtectedPath;
  
  // Only show footer on public pages or when user is not logged in
  const showFooter = !user || !isProtectedPath;
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className={cn(
        "flex-1 pt-16",
        isProtectedPath ? "px-4 md:px-6 pb-6" : "pb-safe"
      )}>
        {children}
      </main>
      
      {/* Show bottom navigation for authenticated users */}
      {showBottomNav && <BottomNavigation />}
      {showFooter && <Footer />}
    </div>
  )
}
