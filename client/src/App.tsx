import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import DiscoverPage from "@/pages/discover";
import MealPlanner from "@/pages/meal-planner";
import Preferences from "@/pages/preferences";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/planner" component={MealPlanner} />
      <Route path="/profile" component={Preferences} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}
