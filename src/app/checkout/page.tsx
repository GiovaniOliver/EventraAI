'use client'

import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// The Stripe public key would be in .env.local for Next.js
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');

// Mock API request function (replace with actual API function later)
const apiRequest = async (method: string, url: string, data: any) => {
  console.log(`Making ${method} request to ${url} with data:`, data);
  // This is a mock implementation that would be replaced with actual API calls
  return {
    json: () => Promise.resolve({ clientSecret: 'mock_client_secret_' + Math.random().toString(36).substr(2, 9) })
  };
};

// Mock auth hook (replace with actual auth hook later)
const useAuth = () => {
  return {
    user: { id: '1', name: 'Test User' },
    isLoading: false
  };
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/dashboard',
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
        router.push('/dashboard');
      }
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
          <CardTitle>Complete Your Purchase</CardTitle>
          <CardDescription>
            Enter your payment details below to complete your purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
        <CardFooter>
          <Button 
            disabled={!stripe || isSubmitting} 
            className="w-full" 
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Complete Payment'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default function Checkout() {
  const [amount, setAmount] = useState(99.99);
  const [clientSecret, setClientSecret] = useState("");
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // Redirect to login page if not authenticated
  useEffect(() => {
    if (user === null && !isLoading) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleCreatePaymentIntent = async () => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCreatingIntent(true);
      const response = await apiRequest("POST", "/api/create-payment-intent", { 
        amount: amount,
        currency: "usd"
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error('Failed to create payment intent:', err);
      setError('Unable to initialize payment. Please try again later.');
    } finally {
      setIsCreatingIntent(false);
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
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
            <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Make a Payment</h1>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Enter Payment Amount</CardTitle>
            <CardDescription>
              Please enter the amount you would like to pay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  placeholder="99.99"
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleCreatePaymentIntent}
              disabled={isCreatingIntent}
            >
              {isCreatingIntent ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing Payment...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Payment</h1>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}