import React from 'react';
import { useLocation } from 'wouter';
import { View } from '@aws-amplify/ui-react';
import { AuthenticatorWrapper, useAuth } from '@/components/auth/AuthenticatorWrapper';

const LoginPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();

  React.useEffect(() => {
    // If user is already authenticated, check if they've paid
    if (isAuthenticated) {
      const hasPaid = localStorage.getItem('hasPaid') === 'true';
      
      if (hasPaid) {
        // If paid, redirect to home
        navigate('/home');
      } else {
        // If not paid, redirect to paywall
        navigate('/paywall');
      }
    }
  }, [isAuthenticated, navigate]);

  return (
    <View width="100%" padding={{ base: '1rem', large: '2rem' }}>
      <AuthenticatorWrapper>
        {/* This content won't show during the auth flow */}
        <View>
          {/* Redirect will happen in useEffect */}
          <p>Authentication successful. Redirecting...</p>
        </View>
      </AuthenticatorWrapper>
    </View>
  );
};

export default LoginPage; 