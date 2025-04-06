import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { BudgetTracker } from "@/components/budget-tracker";
import type { MealPlan, Recipe } from "@shared/schema";

const MealPlanner = () => {
  const { data: mealPlans } = useQuery<MealPlan[]>({
    queryKey: ["/api/mealplans/1"], // TODO: Get userId from auth
  });

  const { data: recipes } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const totalSpent = mealPlans?.reduce((acc, plan) => {
    const recipe = recipes?.find((r) => r.id === plan.recipeId);
    return acc + (recipe?.estimatedCost || 0);
  }, 0) || 0;

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

      <BudgetTracker totalSpent={totalSpent} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {mealPlans?.map((plan) => {
          const recipe = recipes?.find((r) => r.id === plan.recipeId);
          if (!recipe) return null;

          return (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{recipe.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Planned for: {new Date(plan.plannedDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Estimated cost: ${recipe.estimatedCost}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MealPlanner;
