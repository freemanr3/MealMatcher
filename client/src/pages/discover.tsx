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
import { Plus } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

export default function DiscoverPage() {
  const { toast } = useToast();
  const [savedRecipes, setSavedRecipes] = useState<number[]>([]);
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Get user's saved ingredients from localStorage or use default popular ingredients
  const ingredients = JSON.parse(localStorage.getItem('availableIngredients') || '[]');

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes', selectedIngredients],
    queryFn: () => {
      if (selectedIngredients.length > 0) {
        return recipeService.getRecipesByIngredients(selectedIngredients);
      }
      return recipeService.getRandomRecipes(10);
    },
  });

  const handleSaveRecipe = (recipe: RecipeDetail) => {
    // TODO: Implement save recipe functionality
    console.log('Saving recipe:', recipe);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      handleSaveRecipe(recipes[currentIndex]);
    }
    // Move to next recipe
    setCurrentIndex((prev) => (prev + 1) % (recipes?.length || 0));
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
            {selectedIngredients.length > 0 ? 'Recipes Based on Your Ingredients' : 'Popular Recipes'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {selectedIngredients.length > 0 
              ? 'Swipe through recipes that match your available ingredients'
              : 'Discover popular recipes or add ingredients to get personalized suggestions'}
          </p>
        </div>

        <div className="w-full max-w-3xl mx-auto">
          <Carousel
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
            onSelect={(index) => setCurrentIndex(index)}
          >
            <CarouselContent>
              {recipes?.map((recipe: RecipeDetail, index: number) => (
                <CarouselItem key={recipe.id}>
                  <div className="p-1">
                    <Card className="overflow-hidden">
                      <RecipeCard 
                        recipe={recipe}
                        onSave={() => handleSaveRecipe(recipe)}
                        isSaved={savedRecipes.includes(recipe.id)}
                        onSwipe={handleSwipe}
                      />
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:flex justify-center gap-4 mt-4">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        </div>

        {selectedIngredients.length === 0 && (
          <div className="text-center mt-8">
            <Link href="/ingredients">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Ingredients
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 