import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { RecipeCard } from "@/components/recipe-card";
import { recipeService, type RecipeDetail } from "@/services/recipeService";
import { Header } from "@/components/header";

export default function DiscoverPage() {
  const { toast } = useToast();
  const [savedRecipes, setSavedRecipes] = useState<number[]>([]);
  const [, setLocation] = useLocation();

  // Get user's saved ingredients from localStorage or use default popular ingredients
  const ingredients = JSON.parse(localStorage.getItem('availableIngredients') || '[]');

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['discover-recipes', ingredients],
    queryFn: async () => {
      if (ingredients.length > 0) {
        // If user has ingredients, get recipes based on them
        const recipes = await recipeService.getRecipesByIngredients(ingredients, {
          number: 10,
          ranking: 2,
          maxMissingIngredients: 3
        });
        return recipeService.getRecipesBulk(recipes.map(r => r.id));
      } else {
        // Otherwise, get random popular recipes
        const recipes = await recipeService.getRandomRecipes(10);
        return recipes;
      }
    },
  });

  const handleSaveRecipe = (recipeId: number) => {
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    savedRecipes.push(recipeId);
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    setSavedRecipes(savedRecipes);
    
    toast({
      title: "Recipe Saved!",
      description: "This recipe has been added to your meal plan.",
    });
  };

  useEffect(() => {
    // Load saved recipes from localStorage
    const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    setSavedRecipes(saved);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <Header />
        <div className="container mx-auto p-4 pt-20">
          <div className="space-y-4">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <div className="flex justify-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />
      <div className="container mx-auto p-4 pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600">
            {ingredients.length > 0 ? 'Recipes Based on Your Ingredients' : 'Popular Recipes'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {ingredients.length > 0 
              ? 'Swipe through recipes that match your available ingredients'
              : 'Discover popular recipes or add ingredients to get personalized suggestions'}
          </p>
        </div>

        <Carousel className="w-full max-w-3xl mx-auto">
          <CarouselContent>
            {recipes?.map((recipe: RecipeDetail) => (
              <CarouselItem key={recipe.id}>
                <div className="p-1">
                  <Card className="overflow-hidden">
                    <RecipeCard 
                      recipe={recipe}
                      onSave={() => handleSaveRecipe(recipe.id)}
                      isSaved={savedRecipes.includes(recipe.id)}
                    />
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {ingredients.length === 0 && (
          <div className="text-center mt-8">
            <Button 
              variant="outline"
              onClick={() => setLocation('/profile')}
            >
              Add Your Ingredients
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 