import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";

import Layout from "@/components/layout/layout";
import HomePage from "@/pages/home-page";
import Events from "@/pages/events";
import EventDetail from "@/pages/event-detail";
import Discover from "@/pages/discover";
import Tasks from "@/pages/tasks";
import Profile from "@/pages/profile";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin-dashboard";
import PricingPage from "@/pages/pricing";
import AboutPage from "@/pages/about";
import BlogPage from "@/pages/blog";
import PromotionPage from "@/pages/promotion";

import OnboardingModal from "@/components/modals/onboarding-modal";
import { ProtectedRoute } from "@/lib/protected-route";
import { AdminRoute } from "@/lib/admin-route";
import { AuthProvider } from "@/hooks/use-auth";
import { WebSocketProvider } from "@/hooks/websocket-provider";

function Router() {
  const [location] = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("onboardingCompleted");
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);
  
  const handleCompleteOnboarding = () => {
    localStorage.setItem("onboardingCompleted", "true");
    setShowOnboarding(false);
  };

  // Don't show layout on the auth page
  if (location === "/auth") {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
      </Switch>
    );
  }
  
  return (
    <>
      <Layout currentPath={location}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/blog" component={BlogPage} />
          <Route path="/promotion" component={PromotionPage} />
          <Route path="/pricing" component={PricingPage} />
          <ProtectedRoute path="/events" component={Events} />
          <ProtectedRoute path="/events/:id" component={EventDetail} />
          <ProtectedRoute path="/discover" component={Discover} />
          <ProtectedRoute path="/tasks" component={Tasks} />
          <ProtectedRoute path="/analytics" component={Analytics} />
          <ProtectedRoute path="/profile" component={Profile} />
          <ProtectedRoute path="/settings" component={Settings} />
          <AdminRoute path="/admin" component={AdminDashboard} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
      
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)}
        onComplete={handleCompleteOnboarding}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <Router />
          <Toaster />
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
