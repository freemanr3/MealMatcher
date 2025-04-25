import React from 'react';
import { Authenticator, useAuthenticator, View, Image, Heading, Text } from '@aws-amplify/ui-react';
import { useLocation } from 'wouter';

interface AuthenticatorWrapperProps {
  children: React.ReactNode;
}

export const AuthenticatorWrapper: React.FC<AuthenticatorWrapperProps> = ({ children }) => {
  const [, navigate] = useLocation();
  
  // Custom form fields - only include email for sign-in and sign-up
  const formFields = {
    signIn: {
      username: {
        placeholder: 'Email',
        isRequired: true,
        label: 'Email',
      },
      password: {
        isRequired: true,
      },
    },
    signUp: {
      username: {
        placeholder: 'Email',
        isRequired: true,
        label: 'Email',
      },
      password: {
        isRequired: true,
      },
      confirm_password: {
        isRequired: true,
      },
    },
    confirmSignUp: {
      confirmation_code: {
        label: 'Verification Code',
        placeholder: 'Enter the code sent to your email',
        isRequired: true,
      },
    },
  };

  // Custom components for the Authenticator
  const components = {
    Header() {
      return (
        <View textAlign="center" padding="1rem">
          <Heading level={3} padding="1rem 0">Pantry Pal</Heading>
          <Text>Find recipes based on ingredients you already have</Text>
        </View>
      );
    },
    Footer() {
      return (
        <View textAlign="center" padding="1rem">
          <Text fontSize="0.8rem">© {new Date().getFullYear()} Pantry Pal. All rights reserved.</Text>
        </View>
      );
    },
  };

  // Function to handle successful sign-in
  const handleSuccess = () => {
    navigate('/');
    return Promise.resolve();
  };

  return (
    <Authenticator
      formFields={formFields}
      components={components}
      loginMechanisms={['email']}
      hideSignUp={false}
      variation="modal"
      services={{
        handleSignIn: handleSuccess
      }}
    >
      {children}
    </Authenticator>
  );
};

// Hook for checking authentication status
export const useAuth = () => {
  const auth = useAuthenticator();
  return {
    isAuthenticated: auth.authStatus === 'authenticated',
    user: auth.user,
    signOut: auth.signOut,
    ...auth,
  };
};

// HOC to protect routes
export const withAuthProtection = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated } = useAuth();
    const [, navigate] = useLocation();
    const [currentPath] = useLocation();

    React.useEffect(() => {
      if (!isAuthenticated && currentPath !== '/auth') {
        navigate('/auth');
      }
    }, [isAuthenticated, navigate, currentPath]);

    return isAuthenticated ? <Component {...props} /> : null;
  };
}; 