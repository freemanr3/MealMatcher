import { useState, useEffect, useRef } from "react";
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
import { Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useMealPlan } from '@/hooks/use-meal-plan';

// Define dietary preference type
type DietaryPreference = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'low-carb' | 'keto' | 'paleo';

export default function DiscoverPage() {
  const { toast } = useToast();
  const [savedRecipes, setSavedRecipes] = useState<number[]>([]);
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([]);
  const carouselApiRef = useRef(null);
  
  // Get the meal plan functions for saving/skipping recipes
  const { addToMealPlan, skipRecipe } = useMealPlan();

  // Load user preferences from localStorage
  useEffect(() => {
    // Load saved ingredients
    const ingredients = JSON.parse(localStorage.getItem('availableIngredients') || '[]');
    setSelectedIngredients(ingredients);
    
    // Load saved dietary preferences
    const preferences = JSON.parse(localStorage.getItem('dietaryPreferences') || '[]');
    setDietaryPreferences(preferences);
    
    // Load saved recipes
    const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    setSavedRecipes(saved);
    
    // Cleanup carousel event listener
    return () => {
      if (carouselApiRef.current) {
        carouselApiRef.current.off('select', handleCarouselChange);
      }
    };
  }, []);

  // Filter recipes based on dietary preferences
  const filterRecipesByDietaryPreferences = (recipes: RecipeDetail[]): RecipeDetail[] => {
    if (!dietaryPreferences.length) return recipes;
    
    return recipes.filter(recipe => {
      // Check if recipe meets all dietary preferences
      return dietaryPreferences.every(preference => {
        switch (preference) {
          case 'vegetarian':
            return recipe.dietaryTags.includes('vegetarian');
          case 'vegan':
            return recipe.dietaryTags.includes('vegan');
          case 'gluten-free':
            return recipe.dietaryTags.includes('gluten-free');
          case 'dairy-free':
            return recipe.dietaryTags.includes('dairy-free');
          case 'low-carb':
            return recipe.dietaryTags.includes('low-carb');
          case 'keto':
            return recipe.dietaryTags.includes('keto');
          case 'paleo':
            return recipe.dietaryTags.includes('paleo');
          default:
            return true;
        }
      });
    });
  };

  // Query for recipes, considering both ingredients and dietary preferences
  const { data: allRecipes, isLoading } = useQuery({
    queryKey: ['recipes', selectedIngredients, dietaryPreferences],
    queryFn: async () => {
      let recipes;
      if (selectedIngredients.length > 0) {
        recipes = await recipeService.getRecipesByIngredients(selectedIngredients);
      } else {
        recipes = await recipeService.getRandomRecipes(10);
      }
      
      // Pre-filter by dietary preferences
      return recipes;
    },
  });
  
  // Filter recipes with dietary preferences
  const recipes = allRecipes ? filterRecipesByDietaryPreferences(allRecipes) : [];

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

  // Handle saving recipe to meal plan
  const handleSaveToMealPlan = () => {
    if (!recipes || recipes.length === 0) return;
    
    // Get the current recipe based on the currentIndex
    const currentRecipe = recipes[currentIndex % recipes.length];
    
    if (currentRecipe) {
      // Add recipe to meal plan
      addToMealPlan(currentRecipe);
      
      toast({
        title: "Recipe added to meal plan",
        description: `${currentRecipe.title} has been added to your meal plan.`
      });
      
      // Move to the next recipe in the carousel
      if (carouselApiRef.current) {
        carouselApiRef.current.scrollNext();
      }
    }
  };
  
  // Handle skipping recipe
  const handleSkipRecipe = () => {
    if (!recipes || recipes.length === 0) return;
    
    // Get the current recipe based on the currentIndex
    const currentRecipe = recipes[currentIndex % recipes.length];
    
    if (currentRecipe) {
      // Skip the recipe
      skipRecipe(currentRecipe);
      
      toast({
        title: "Recipe skipped",
        description: `${currentRecipe.title} has been added to your skipped recipes.`
      });
      
      // Move to the next recipe in the carousel
      if (carouselApiRef.current) {
        carouselApiRef.current.scrollNext();
      }
    }
  };

  // Track the current index in the carousel
  const handleCarouselChange = (api) => {
    const currentSlideIndex = api.selectedScrollSnap();
    setCurrentIndex(currentSlideIndex);
  };

  // Set up the carousel API reference
  const setCarouselApi = (api) => {
    carouselApiRef.current = api;
    
    if (api) {
      api.on('select', () => handleCarouselChange(api));
    }
  };

  // Handle navigation to preferences page
  const handleGoToPreferences = () => {
    setLocation('/preferences');
  };

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

  // Show a message if no recipes match the dietary preferences
  const noRecipesFound = recipes.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />
      <div className="container mx-auto p-4 pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600">
            {selectedIngredients.length > 0 ? 'Recipes Based on Your Preferences' : 'Popular Recipes'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {selectedIngredients.length > 0 
              ? 'Swipe through recipes that match your available ingredients and dietary preferences'
              : 'Discover popular recipes or add ingredients to get personalized suggestions'}
          </p>
          
          {/* Display dietary preferences if any are selected */}
          {dietaryPreferences.length > 0 && (
            <div className="flex justify-center flex-wrap gap-2 mt-4">
              {dietaryPreferences.map(pref => (
                <span key={pref} className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
                  {pref}
                </span>
              ))}
            </div>
          )}
        </div>

        {noRecipesFound ? (
          <div className="text-center p-8 bg-white rounded-lg shadow-sm border">
            <h3 className="text-xl font-medium mb-4">No matching recipes found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any recipes that match your current dietary preferences. 
              Try adjusting your preferences or ingredients to see more options.
            </p>
            <Button onClick={handleGoToPreferences}>
              Update Preferences
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto">
            <Carousel
              className="w-full"
              opts={{
                align: "start",
                loop: true,
              }}
              setApi={setCarouselApi}
            >
              <CarouselContent>
                {recipes.map((recipe: RecipeDetail, index: number) => (
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
                {/* Custom Previous Button with Skip functionality */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={handleSkipRecipe}
                >
                  <ArrowLeft className="h-5 w-5 text-red-500" />
                  <span className="sr-only">Skip recipe</span>
                </Button>
                
                {/* Custom Next Button with Save functionality */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={handleSaveToMealPlan}
                >
                  <ArrowRight className="h-5 w-5 text-green-500" />
                  <span className="sr-only">Save recipe</span>
                </Button>
              </div>
            </Carousel>
            
            {/* Helper text to explain the buttons */}
            <div className="text-center mt-4 text-sm text-muted-foreground">
              <p>Left arrow: Skip recipe | Right arrow: Add to meal plan</p>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Button onClick={handleGoToPreferences}>
            <Plus className="mr-2 h-4 w-4" />
            Update Preferences
          </Button>
        </div>
      </div>
    </div>
  );
} 