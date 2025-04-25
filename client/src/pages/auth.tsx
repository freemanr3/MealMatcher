import React from 'react';
import { useLocation } from 'wouter';
import { View } from '@aws-amplify/ui-react';
import { AuthenticatorWrapper, useAuth } from '@/components/auth/AuthenticatorWrapper';

const AuthPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  React.useEffect(() => {
    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      navigate('/');
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

export default AuthPage; 