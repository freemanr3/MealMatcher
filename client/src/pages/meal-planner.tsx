import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { BudgetTracker } from "@/components/budget-tracker";
import type { MealPlan, Recipe } from "@shared/schema";

export default function MealPlanner() {
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-2">Meal Planner</h1>
        </div>

        <div className="mb-6">
          <BudgetTracker budget={100} spent={totalSpent} />
        </div>

        <div className="grid gap-4">
          {mealPlans?.map((plan) => {
            const recipe = recipes?.find((r) => r.id === plan.recipeId);
            if (!recipe) return null;

            return (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle>{recipe.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {recipe.description}
                      </p>
                      <p className="text-sm">
                        Planned for: {new Date(plan.plannedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
