import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { BudgetTracker } from "@/components/budget-tracker";
import type { Recipe } from "@/lib/types";
import type { MealPlanWithRecipe } from "@shared/schema";

const MealPlanner = () => {
  const { data: mealPlansWithRecipes = [], isLoading } = useQuery<MealPlanWithRecipe[]>({
    queryKey: ["mealplans"],
    queryFn: async () => {
      const response = await fetch("/api/mealplans/1"); // TODO: Get userId from auth
      if (!response.ok) throw new Error("Failed to fetch meal plans");
      return response.json();
    }
  });

  // Calculate total spent from meal plans
  const totalSpent = mealPlansWithRecipes.reduce(
    (acc, plan) => acc + plan.recipe.estimatedCost, 
    0
  );

  // Assuming user has a budget of 100 for demo purposes
  // In a real app, this would come from user settings
  const userBudget = 100;

  if (isLoading) {
    return <div>Loading meal plans...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link href="/discover">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-4">Meal Planner</h1>
      </div>

      <BudgetTracker budget={userBudget} spent={totalSpent} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {mealPlansWithRecipes.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.recipe.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Planned for: {new Date(plan.plannedDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Estimated cost: ${plan.recipe.estimatedCost}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MealPlanner;
