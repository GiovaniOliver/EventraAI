import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check if user has an active subscription
  const hasActiveSubscription = user && 
    user.subscriptionStatus === "active" && 
    user.subscriptionTier !== undefined;

  useEffect(() => {
    // If user is authenticated but doesn't have an active subscription,
    // show a toast and redirect to pricing page
    if (user && !hasActiveSubscription && !isLoading) {
      toast({
        title: "Subscription Required",
        description: "You need an active subscription to access this feature.",
        variant: "destructive",
      });
      setLocation("/pricing");
    }
  }, [user, hasActiveSubscription, isLoading, toast, setLocation]);

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        if (!hasActiveSubscription) {
          return <Redirect to="/pricing" />;
        }

        return <Component />;
      }}
    </Route>
  );
}