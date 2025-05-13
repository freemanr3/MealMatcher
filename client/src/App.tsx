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
import RecipeDetail from '@/pages/recipe-detail';
import { useAuth } from '@/context/AuthContext';
import { AuthProvider } from '@/context/AuthContext';
import CognitoOAuthHandler from '@/components/auth/CognitoOAuthHandler';
import React from 'react';

// Define proper types for route components and props
type RouteComponentProps = {
  params?: {
    id?: string;
    [key: string]: string | undefined;
  };
};

type ProtectedRouteProps = {
  component: React.ComponentType<RouteComponentProps>;
  params?: RouteComponentProps['params'];
};

function ProtectedRoute({ component: Component, params }: ProtectedRouteProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation('/auth');
    return null;
  }

  return <Component params={params} />;
}

function Router() {
  // Get user authentication state
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  return (
    <Switch>
      <Route path="/auth">
        {(params) => {
          // If user is already logged in, redirect to discover page
          if (user) {
            setLocation('/discover');
            return null;
          }
          return <AuthPage params={params} />;
        }}
      </Route>
      <Route path="/oauth/callback">
        {(params) => <CognitoOAuthHandler params={params} />}
      </Route>
      <Route path="/pricing">
        {(params) => <PricingPage params={params} />}
      </Route>
      <Route path="/">
        {(params) => {
          // Redirect root path to discover for authenticated users
          if (user) {
            setLocation('/discover');
            return null;
          }
          return <HomePage params={params} />;
        }}
      </Route>
      <Route path="/discover">
        {(params) => <ProtectedRoute component={DiscoverPage} params={params} />}
      </Route>
      <Route path="/ingredients">
        {(params) => <ProtectedRoute component={IngredientsPage} params={params} />}
      </Route>
      <Route path="/preferences">
        {(params) => <ProtectedRoute component={IngredientsPage} params={params} />}
      </Route>
      <Route path="/meal-planner">
        {(params) => <ProtectedRoute component={MealPlanner} params={params} />}
      </Route>
      <Route path="/recipes/:id">
        {(params) => <ProtectedRoute component={RecipeDetail} params={params} />}
      </Route>
      <Route>
        {(params) => <NotFound params={params} />}
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <Router />
      </div>
      <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
