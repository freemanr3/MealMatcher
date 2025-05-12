import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useElements, useStripe, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { useAuth } from '@/hooks/useAuth';
import { createSubscription } from '@/services/stripe';
import { useStripe as useStripeContext } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { setClientSecret } = useStripeContext();
  
  const stripe = useStripe();
  const elements = useElements();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubscriptionCreated, setIsSubscriptionCreated] = useState(false);

  // Redirect if no user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Create subscription when component mounts
  useEffect(() => {
    const initializeSubscription = async () => {
      if (!user || isSubscriptionCreated) return;
      
      setIsLoading(true);
      setErrorMessage(null);
      
      try {
        const { clientSecret } = await createSubscription({
          email: user.email,
          userId: user.id,
          name: user.name,
        });
        
        setClientSecret(clientSecret);
        setIsSubscriptionCreated(true);
      } catch (error) {
        console.error('Failed to create subscription:', error);
        setErrorMessage(
          error instanceof Error 
            ? error.message 
            : 'Failed to set up payment. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeSubscription();
  }, [user, setClientSecret, isSubscriptionCreated]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Return URL where the customer should be redirected after payment
          return_url: `${window.location.origin}/subscription-success`,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'An unexpected error occurred.');
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred during payment processing.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Subscription</CardTitle>
          <CardDescription>
            Start your 14-day free trial. You won't be charged until the trial ends.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}
          
          {isSubscriptionCreated && stripe && elements ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <PaymentElement />
                <AddressElement options={{ mode: 'billing' }} />
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-4" 
                disabled={isLoading || !stripe || !elements}
              >
                {isLoading ? 'Processing...' : 'Start Free Trial'}
              </Button>
            </form>
          ) : (
            <div className="flex justify-center py-6">
              {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              ) : (
                <p>Loading payment form...</p>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 text-sm text-muted-foreground">
          <p>Your subscription will start with a 14-day free trial.</p>
          <p>You can cancel anytime before the trial ends to avoid being charged.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CheckoutPage; 