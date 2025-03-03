import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import MealSwiper from "@/pages/meal-swiper";
import MealPlanner from "@/pages/meal-planner";
import Preferences from "@/pages/preferences";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/swipe" component={MealSwiper} />
      <Route path="/planner" component={MealPlanner} />
      <Route path="/preferences" component={Preferences} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
