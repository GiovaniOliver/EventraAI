'use client'

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";

// This is a temporary placeholder - in a real app, we would import these from Stripe
// The implementation will need to use Stripe Elements which requires client side code
const MockPaymentElement = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <label className="text-sm font-medium">Card number</label>
      <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
        •••• •••• •••• ••••
      </div>
    </div>
    <div className="flex space-x-4">
      <div className="space-y-2 flex-1">
        <label className="text-sm font-medium">Expiration date</label>
        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          MM / YY
        </div>
      </div>
      <div className="space-y-2 flex-1">
        <label className="text-sm font-medium">CVC</label>
        <div className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          •••
        </div>
      </div>
    </div>
  </div>
);

const SubscribeForm = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Payment Successful",
        description: "You are now subscribed!",
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast({
        title: "Payment Error",
        description: "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Subscription</CardTitle>
          <CardDescription>
            Enter your payment details below to complete your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MockPaymentElement />
        </CardContent>
        <CardFooter>
          <Button 
            disabled={isSubmitting} 
            className="w-full" 
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Subscribe Now'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Simulate authentication check and API call for client secret
  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate successful response
        setClientSecret("mock_client_secret");
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to get subscription client secret:', err);
        setError('Unable to initialize payment. Please try again later.');
        setIsLoading(false);
      }
    };

    // In a real app, we would check if user is authenticated here
    const isAuthenticated = true; // Mock authentication state
    
    if (isAuthenticated) {
      fetchClientSecret();
    } else {
      router.push('/auth');
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" aria-label="Loading"/>
          <p className="text-muted-foreground">Preparing your subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Payment Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button onClick={() => router.push('/pricing')}>Back to Pricing</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Unable to Start Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">We couldn't initialize your subscription process. Please try again later.</p>
            <Button onClick={() => router.push('/pricing')}>Back to Pricing</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Subscription</h1>
      {/* In a real app, we would wrap this in Stripe Elements provider */}
      <SubscribeForm />
    </div>
  );
}