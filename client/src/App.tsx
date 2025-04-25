import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import DiscoverPage from "@/pages/discover";
import MealPlanner from "@/pages/meal-planner";
import { IngredientsPage } from '@/pages/preferences';
import { Header } from '@/components/header';
import HomePage from '@/pages/home';
import PricingPage from '@/pages/pricing';
import { AuthenticatorWrapper, useAuth, withAuthProtection } from '@/components/auth/AuthenticatorWrapper';

// Enhance components with auth protection
const ProtectedHomePage = withAuthProtection(HomePage);
const ProtectedMealPlannerPage = withAuthProtection(MealPlanner);
const ProtectedIngredientsPage = withAuthProtection(IngredientsPage);

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/" component={ProtectedHomePage} />
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/ingredients" component={ProtectedIngredientsPage} />
      <Route path="/meal-planner" component={ProtectedMealPlannerPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// AuthStateListener to handle auth state changes
const AuthStateListener = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Listen for auth state changes
  React.useEffect(() => {
    console.log('Auth state changed:', isAuthenticated ? 'Logged in' : 'Logged out');
  }, [isAuthenticated]);

  return <>{children}</>;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthStateListener>
        <div className="min-h-screen bg-background">
          <Header />
          <Router />
        </div>
        <Toaster />
      </AuthStateListener>
    </QueryClientProvider>
  );
}
