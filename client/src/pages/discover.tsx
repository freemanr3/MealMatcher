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

  const handleLike = (recipeId: number) => {
    // Update saved recipes list
    const newSavedRecipes = [...savedRecipes];
    if (newSavedRecipes.includes(recipeId)) {
      const index = newSavedRecipes.indexOf(recipeId);
      newSavedRecipes.splice(index, 1);
    } else {
      newSavedRecipes.push(recipeId);
    }
    setSavedRecipes(newSavedRecipes);
    localStorage.setItem('savedRecipes', JSON.stringify(newSavedRecipes));
    
    // Find the recipe and save it
    const recipe = recipes?.find(r => r.id === recipeId);
    if (recipe) {
      recipeService.saveRecipe(recipe)
        .then(() => {
          toast({
            title: "Recipe saved",
            description: `${recipe.title} has been saved to your favorites`,
          });
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Failed to save recipe",
            variant: "destructive",
          });
        });
    }
  };

  const handleViewDetails = (recipeId: number) => {
    setLocation(`/recipes/${recipeId}`);
  };

  const handleCarouselChange = (event: React.SyntheticEvent<HTMLDivElement>) => {
    // Get the current index from the carousel
    // This will need to be handled differently since we can't get the index directly
    // For now, we'll keep track of it ourselves
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
          >
            <CarouselContent>
              {recipes?.map((recipe: RecipeDetail, index: number) => (
                <CarouselItem key={recipe.id}>
                  <div className="p-1">
                    <Card className="overflow-hidden">
                      <RecipeCard 
                        recipe={recipe}
                        onLike={handleLike}
                        onViewDetails={handleViewDetails}
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