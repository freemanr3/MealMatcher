import React, { useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import DiscoverPage from "@/pages/discover";
import MealPlanner from "@/pages/meal-planner";
import { IngredientsPage } from '@/pages/preferences';
import { Header } from '@/components/header';
import HomePage from '@/pages/home';
import PricingPage from '@/pages/pricing';
import LoginPage from '@/pages/login';
import PaywallPage from '@/pages/paywall';
import { useAuth } from '@/components/auth/AuthenticatorWrapper';
import { withPaywallProtection, withAuthProtection } from '@/components/auth/withPaywallProtection';

// Enhance components with payment protection
const ProtectedHomePage = withPaywallProtection(HomePage);
const ProtectedDiscoverPage = withPaywallProtection(DiscoverPage);
const ProtectedMealPlannerPage = withPaywallProtection(MealPlanner);
const ProtectedIngredientsPage = withPaywallProtection(IngredientsPage);

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/paywall" component={PaywallPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/" component={ProtectedHomePage} />
      <Route path="/home" component={ProtectedHomePage} />
      <Route path="/discover" component={ProtectedDiscoverPage} />
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
  useEffect(() => {
    // For demo purposes - in a real app, this would be more sophisticated
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
