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

function ProtectedRoute({ component: Component, ...rest }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation('/auth');
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  // Get user authentication state
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  return (
    <Switch>
      <Route path="/auth" component={(props) => {
        // If user is already logged in, redirect to discover page
        if (user) {
          setLocation('/discover');
          return null;
        }
        return <AuthPage {...props} />;
      }} />
      <Route path="/oauth/callback" component={CognitoOAuthHandler} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/" component={(props) => {
        // Redirect root path to discover for authenticated users
        if (user) {
          setLocation('/discover');
          return null;
        }
        return <ProtectedRoute component={HomePage} {...props} />;
      }} />
      <Route path="/discover" component={(props) => <ProtectedRoute component={DiscoverPage} {...props} />} />
      <Route path="/ingredients" component={(props) => <ProtectedRoute component={IngredientsPage} {...props} />} />
      <Route path="/preferences" component={(props) => <ProtectedRoute component={IngredientsPage} {...props} />} />
      <Route path="/meal-planner" component={(props) => <ProtectedRoute component={MealPlanner} {...props} />} />
      <Route path="/recipes/:id" component={(props) => <ProtectedRoute component={RecipeDetail} {...props} />} />
      <Route component={NotFound} />
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
