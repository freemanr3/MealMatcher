import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn, signUp, confirmSignUp, signOut, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

// Define the User interface to match existing app expectations
interface User {
  id: string;
  email: string;
  name: string;
  username: string;
}

// Auth context type definition
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (username: string, email: string, password: string) => Promise<{ userConfirmed: boolean; userSub: string; username: string }>;
  confirmAccount: (username: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect to check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUser = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        
        setUser({
          id: currentUser.userId,
          email: attributes.email || '',
          name: attributes.name || '',
          username: currentUser.username
        });
      } catch (error) {
        // No user is signed in
        console.log('No authenticated user');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    try {
      await signIn({ username: email, password });
      
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      const userData: User = {
        id: currentUser.userId,
        email: attributes.email || '',
        name: attributes.name || '',
        username: currentUser.username
      };

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Signup function
  const signup = async (username: string, email: string, password: string) => {
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
            name: username
          },
        },
      });

      return { 
        userConfirmed: isSignUpComplete, 
        userSub: userId,
        username
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Confirm signup function
  const confirmAccount = async (username: string, code: string): Promise<void> => {
    try {
      await confirmSignUp({
        username,
        confirmationCode: code
      });
    } catch (error) {
      console.error('Confirmation error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Create the context value
  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    signup,
    confirmAccount,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 