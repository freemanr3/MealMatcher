import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MealCard } from "@/components/meal-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Recipe } from "@shared/schema";

export default function MealSwiper() {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const addToMealPlanMutation = useMutation({
    mutationFn: async (recipeId: number) => {
      const res = await fetch("/api/mealplans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1, // TODO: Get from auth
          recipeId,
          date: new Date().toISOString().split("T")[0],
        }),
      });
      if (!res.ok) throw new Error("Failed to add to meal plan");
      return res.json();
    },
  });

  const handleSwipe = (direction: "left" | "right") => {
    if (!recipes) return;

    if (direction === "right") {
      addToMealPlanMutation.mutate(recipes[currentIndex].id, {
        onSuccess: () => {
          toast({
            title: "Added to meal plan!",
            description: `${recipes[currentIndex].name} has been added to your meal plan.`,
          });
        },
      });
    }

    if (currentIndex < recipes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!recipes || recipes.length === 0) {
    return <div>No recipes found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-2">Find Meals</h1>
        </div>

        {currentIndex < recipes.length ? (
          <MealCard
            recipe={recipes[currentIndex]}
            onSwipe={handleSwipe}
          />
        ) : (
          <div className="text-center p-6">
            <h2 className="text-xl font-semibold mb-4">No more recipes!</h2>
            <Button onClick={() => setCurrentIndex(0)}>Start Over</Button>
          </div>
        )}
      </div>
    </div>
  );
}
