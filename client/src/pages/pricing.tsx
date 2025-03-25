import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Info } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

export default function PricingPage() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [_, navigate] = useLocation();

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ["/api/subscription-plans"],
    queryFn: async () => {
      const response = await fetch("/api/subscription-plans");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription plans");
      }
      return response.json();
    },
  });

  const handleSubscribe = async (planName: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in before subscribing to a plan",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/create-subscription", { planName });
      const data = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = data.checkoutUrl;
    } catch (error) {
      toast({
        title: "Subscription Error",
        description: "Failed to initiate subscription process. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isCurrentPlan = (planName: string) => {
    return user?.subscriptionTier === planName;
  };

  if (isLoading || authLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold text-center mb-10">Subscription Plans</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-6 w-20 mb-4" />
                <div className="space-y-2">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't load the subscription plans. Please try again later.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-3">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground">
          Select the perfect plan to elevate your virtual event planning experience
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans?.map((plan) => (
          <Card 
            key={plan.id} 
            className={`flex flex-col ${plan.name === 'pro' ? 'border-primary shadow-lg relative' : ''}`}
          >
            {plan.name === 'pro' && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.displayName}
                {plan.name === 'enterprise' && (
                  <Dialog>
                    <DialogTrigger>
                      <Info size={16} className="text-muted-foreground cursor-pointer" />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Enterprise Plan Features</DialogTitle>
                        <DialogDescription>
                          Our Enterprise plan includes custom solutions tailored to your organization's needs.
                          Contact us for a personalized quote and to discuss your specific requirements.
                        </DialogDescription>
                      </DialogHeader>
                      <Button onClick={() => window.location.href = "mailto:sales@eventplanner.com"}>
                        Contact Sales
                      </Button>
                    </DialogContent>
                  </Dialog>
                )}
              </CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">${(plan.price / 100).toFixed(2)}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="mt-2">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <h4 className="font-medium mb-3">Features include:</h4>
              <ul className="space-y-2">
                {JSON.parse(plan.features).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe(plan.name)}
                variant={isCurrentPlan(plan.name) ? "outline" : "default"}
                disabled={isCurrentPlan(plan.name)}
              >
                {isCurrentPlan(plan.name) ? "Current Plan" : "Subscribe"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 bg-muted p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
        <p className="mb-4">
          Our Enterprise plan offers flexibility for organizations with specific requirements.
          Get in touch with our sales team to discuss your needs.
        </p>
        <Button onClick={() => window.location.href = "mailto:sales@eventplanner.com"}>
          Contact Sales
        </Button>
      </div>
    </div>
  );
}