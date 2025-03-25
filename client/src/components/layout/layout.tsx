import Header from "./header";
import BottomNavigation from "./bottom-navigation";
import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

interface LayoutProps {
  children: ReactNode;
  currentPath: string;
}

export default function Layout({ children, currentPath }: LayoutProps) {
  const { user } = useAuth();
  
  // List of paths that should show bottom navigation (only for authenticated users)
  const protectedPaths = [
    "/dashboard",
    "/events", 
    "/discover", 
    "/tasks", 
    "/analytics", 
    "/profile", 
    "/settings"
  ];
  
  // Check if current path starts with any of the protected paths
  const isProtectedPath = protectedPaths.some(path => 
    currentPath === path || 
    currentPath.startsWith(`${path}/`)
  );
  
  // Only show bottom navigation for authenticated users on protected paths
  const showBottomNav = !!user && isProtectedPath;
  
  // Adjust bottom padding based on whether bottom nav is shown
  const mainPadding = showBottomNav ? "pb-24" : "pb-10";
  
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />
      <main className={`flex-grow pt-16 ${mainPadding} overflow-x-hidden`}>
        {children}
      </main>
      {showBottomNav && <BottomNavigation currentPath={currentPath} />}
    </div>
  );
}
