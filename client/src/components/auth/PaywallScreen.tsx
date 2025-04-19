import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, Heading, Text, Button, TextField, Flex, View } from '@aws-amplify/ui-react';
import { useAuth } from './AuthenticatorWrapper';

// In a real app, you would integrate with Stripe.js here
// import { loadStripe } from '@stripe/stripe-js';
// const stripePromise = loadStripe('your_stripe_public_key');

export const PaywallScreen: React.FC = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [isPromoValid, setIsPromoValid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Simple function to validate promo codes - in a real app, this would call an API
  const validatePromoCode = () => {
    // Example: FREEMEAL as valid promo code (in a real app, check against backend)
    if (promoCode.toUpperCase() === 'FREEMEAL') {
      setIsPromoValid(true);
      setErrorMessage('');
      // In a real app, you would store this in your database
      localStorage.setItem('hasPaid', 'true');
      setTimeout(() => navigate('/home'), 1000); // Redirect after 1 second
    } else {
      setIsPromoValid(false);
      setErrorMessage('Invalid promo code');
    }
  };

  // Mock payment handler - in a real app, you would use Stripe Checkout
  const handlePayment = () => {
    setIsProcessing(true);
    setErrorMessage('');
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      // In a real app, you would verify the payment with your backend
      localStorage.setItem('hasPaid', 'true');
      navigate('/home');
    }, 2000);
    
    // In a real implementation with Stripe:
    // 1. Call your backend to create a Stripe Checkout session
    // 2. Redirect to Stripe Checkout page
    // 3. Handle redirect back to your app after payment
  };

  return (
    <View
      backgroundColor="background.secondary"
      padding="2rem"
      width="100%"
      height="100vh"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Card width="450px" padding="2rem">
        <Heading level={3} padding="0 0 1rem">
          Unlock Premium Features
        </Heading>
        
        <Text paddingBottom="1rem">
          Welcome{user ? `, ${user.username}` : ''}! To access all features, 
          choose from the options below:
        </Text>
        
        <View as="section" padding="1rem 0">
          <Heading level={5} paddingBottom="0.5rem">
            Premium Plan - $9.99/month
          </Heading>
          <Text paddingBottom="1rem">
            Get unlimited access to all recipes, meal planning, and grocery list features.
          </Text>
          <Button
            variation="primary"
            onClick={handlePayment}
            isLoading={isProcessing}
            loadingText="Processing Payment..."
            width="100%"
          >
            Subscribe Now
          </Button>
        </View>
        
        <View as="section" padding="1rem 0">
          <Heading level={5} paddingBottom="0.5rem">
            Have a Promo Code?
          </Heading>
          <Flex direction="column" gap="0.5rem">
            <TextField
              label="Promo Code"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              hasError={!!errorMessage}
              errorMessage={errorMessage}
            />
            <Button
              onClick={validatePromoCode}
              variation="link"
              isDisabled={!promoCode.trim()}
            >
              Apply Promo Code
            </Button>
            {isPromoValid && (
              <Text color="green">
                Promo code applied successfully! Redirecting...
              </Text>
            )}
          </Flex>
        </View>
      </Card>
    </View>
  );
}; 