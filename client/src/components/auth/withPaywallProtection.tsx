import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from './AuthenticatorWrapper';

// Custom hook to check if user has paid
export const usePaymentStatus = () => {
  const { isAuthenticated, user } = useAuth();
  
  // In a real app, you would fetch this from your backend API
  // For demo purposes, we're using localStorage
  const hasPaid = typeof window !== 'undefined' ? localStorage.getItem('hasPaid') === 'true' : false;
  
  return {
    isAuthenticated,
    hasPaid,
    user,
  };
};

// HOC to protect routes that require payment
export const withPaywallProtection = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated, hasPaid } = usePaymentStatus();
    const [, navigate] = useLocation();
    const [currentPath] = useLocation();

    useEffect(() => {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      
      // If authenticated but hasn't paid, redirect to paywall
      if (isAuthenticated && !hasPaid && currentPath !== '/paywall') {
        navigate('/paywall');
      }
    }, [isAuthenticated, hasPaid, navigate, currentPath]);

    // Only render the component if user is authenticated and has paid
    return isAuthenticated && hasPaid ? <Component {...props} /> : null;
  };
};

// HOC for features that require auth but not payment
export const withAuthProtection = <P extends object>(Component: React.ComponentType<P>) => {
  const EnhancedComponent = (props: P) => {
    const { isAuthenticated } = useAuth();
    const [, navigate] = useLocation();

    useEffect(() => {
      if (!isAuthenticated) {
        navigate('/login');
      }
    }, [isAuthenticated, navigate]);

    return isAuthenticated ? <Component {...props} /> : null;
  };

  return EnhancedComponent;
}; 