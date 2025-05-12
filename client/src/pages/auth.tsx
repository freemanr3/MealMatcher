import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

const AuthPage: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // If user is authenticated
    if (user) {
      // Check if user is new and redirect to checkout
      if (user.isNewUser) {
        navigate('/checkout');
      } else {
        // Otherwise redirect to home
        navigate('/');
      }
    }
  }, [user, navigate]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        {/* Auth form would be here */}
        <p className="text-center text-muted-foreground text-sm mt-4">
          {user ? 'Authentication successful. Redirecting...' : 'Please sign in to continue.'}
        </p>
      </div>
    </div>
  );
};

export default AuthPage; 