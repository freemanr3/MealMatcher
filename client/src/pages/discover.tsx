import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { RecipeCard } from "@/components/recipe-card";
import { PageHeaderSkeleton, CarouselSkeleton } from "@/components/ui/loading-skeleton";
import { recipeService, type RecipeDetail } from "@/services/recipeService";
import { Plus, ArrowLeft, ArrowRight, Heart, X, ChefHat, Clock, Users, Star, TrendingUp, RotateCcw } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useMealPlan } from '@/hooks/use-meal-plan';

// Define dietary preference type
type DietaryPreference = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'low-carb' | 'keto' | 'paleo';

// Define meal type
type MealType = 'main course' | 'side dish' | 'appetizer' | 'breakfast' | 'dessert' | 'snack' | 'drink' | 'any';

// Define props type
type DiscoverPageProps = {
  params?: {
    [key: string]: string | undefined;
  };
};

export default function DiscoverPage({ params }: DiscoverPageProps) {
  const { toast } = useToast();
  const [savedRecipes, setSavedRecipes] = useState<number[]>([]);
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('any');
  const carouselApiRef = useRef(null);
  
  // Track processed recipes (skipped or saved) to remove them from the queue
  const [processedRecipeIds, setProcessedRecipeIds] = useState<Set<number>>(new Set());
  const [totalRecipesProcessed, setTotalRecipesProcessed] = useState(0);
  
  // Get the meal plan functions for saving/skipping recipes
  const { addToMealPlan, skipRecipe, removeFromMealPlan, mealPlan } = useMealPlan();

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
    
    // Reset processed recipes when preferences change
    setProcessedRecipeIds(new Set());
    setTotalRecipesProcessed(0);
    setCurrentIndex(0);
    
    // Cleanup carousel event listener
    return () => {
      if (carouselApiRef.current) {
        carouselApiRef.current.off('select', handleCarouselChange);
      }
    };
  }, [selectedIngredients.join(','), selectedMealType, dietaryPreferences.join(',')]);

  // Filter recipes based on dietary preferences and meal type
  const filterRecipes = (recipes: RecipeDetail[]): RecipeDetail[] => {
    let filtered = recipes;
    
    // Filter by meal type
    if (selectedMealType !== 'any') {
      filtered = filtered.filter(recipe => 
        recipe.dishTypes.includes(selectedMealType)
      );
    }
    
    // Filter by dietary preferences
    if (dietaryPreferences.length) {
      filtered = filtered.filter(recipe => {
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
    }
    
    return filtered;
  };

  // Query for recipes, considering ingredients, meal type, and dietary preferences
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes', selectedIngredients, selectedMealType, dietaryPreferences],
    queryFn: async () => {
      let recipeData;
      if (selectedIngredients.length > 0) {
        // If meal type is selected, pass it as an option
        const options = selectedMealType !== 'any' ? { dishType: selectedMealType } : {};
        recipeData = await recipeService.getRecipesByIngredients(selectedIngredients, options);
      } else {
        // If no ingredients, get random recipes (optionally filtered by meal type)
        recipeData = await recipeService.getRandomRecipes(10, selectedMealType);
      }
      
      // If we have basic recipe data, get full details for all at once
      if (recipeData && recipeData.length > 0) {
        const recipeIds = recipeData.map(r => r.id);
        const detailedRecipes = await recipeService.getRecipesBulk(recipeIds);
        return detailedRecipes;
      }
      
      return recipeData || [];
    },
    // Longer stale time since we have aggressive caching in the service
    staleTime: 10 * 60 * 1000, // 10 minutes
    // Enable background refetching when ingredients change
    refetchOnWindowFocus: false,
  });
  
  // Apply dietary preferences filter and remove processed recipes
  const allFilteredRecipes = recipes ? filterRecipes(recipes) : [];
  const availableRecipes = allFilteredRecipes.filter(recipe => !processedRecipeIds.has(recipe.id));
  
  // Calculate total recipes (including processed ones for progress tracking)
  const totalRecipesFound = allFilteredRecipes.length;

  const handleLike = (recipeId: number) => {
    // Find the recipe
    const recipe = availableRecipes?.find(r => r.id === recipeId);
    if (!recipe) return;

    // Check if recipe is already in meal plan
    const isCurrentlyInMealPlan = mealPlan.some(r => r.id === recipeId);
    
    if (isCurrentlyInMealPlan) {
      // Remove from meal plan
      removeFromMealPlan(recipeId);
      
      // Update local saved recipes state to keep UI in sync
      const newSavedRecipes = savedRecipes.filter(id => id !== recipeId);
      setSavedRecipes(newSavedRecipes);
      localStorage.setItem('savedRecipes', JSON.stringify(newSavedRecipes));
      
      toast({
        title: "Recipe removed ❤️",
        description: `${recipe.title} has been removed from your meal plan`,
        duration: 2000,
      });
    } else {
      // Add to meal plan
      const wasAdded = addToMealPlan(recipe);
      
      if (wasAdded) {
        // Update local saved recipes state to keep UI in sync
        const newSavedRecipes = [...savedRecipes];
        if (!newSavedRecipes.includes(recipeId)) {
      newSavedRecipes.push(recipeId);
    }
    setSavedRecipes(newSavedRecipes);
    localStorage.setItem('savedRecipes', JSON.stringify(newSavedRecipes));
    
          toast({
          title: "Recipe saved to meal plan! ❤️",
          description: `${recipe.title} has been added to your meal plan`,
          duration: 2000,
          });
      } else {
          toast({
          title: "Already in meal plan",
          description: `${recipe.title} is already in your meal plan`,
          duration: 2000,
          });
      }
    }
  };

  const handleViewDetails = (recipeId: number) => {
    setLocation(`/recipe/${recipeId}`);
  };

  // Handle saving recipe to meal plan
  const handleSaveToMealPlan = () => {
    if (!availableRecipes || availableRecipes.length === 0) return;
    
    // Get the current recipe based on the currentIndex
    const currentRecipe = availableRecipes[currentIndex];
    
    if (currentRecipe) {
      // Add recipe to meal plan
      addToMealPlan(currentRecipe);
      
      // Mark recipe as processed
      setProcessedRecipeIds(prev => new Set([...prev, currentRecipe.id]));
      setTotalRecipesProcessed(prev => prev + 1);
      
      toast({
        title: "Added to meal plan! 🍽️",
        description: `${currentRecipe.title} has been added to your meal plan.`,
        duration: 2000,
      });
      
      // Move to the next recipe automatically
      handleNextRecipe();
    }
  };
  
  // Handle skipping recipe
  const handleSkipRecipe = () => {
    if (!availableRecipes || availableRecipes.length === 0) return;
    
    // Get the current recipe based on the currentIndex
    const currentRecipe = availableRecipes[currentIndex];
    
    if (currentRecipe) {
      // Skip the recipe
      skipRecipe(currentRecipe);
      
      // Mark recipe as processed
      setProcessedRecipeIds(prev => new Set([...prev, currentRecipe.id]));
      setTotalRecipesProcessed(prev => prev + 1);
      
      toast({
        title: "Recipe skipped ⏭️",
        description: "We'll show you something different next time.",
        duration: 2000,
      });
      
      // Move to the next recipe automatically
      handleNextRecipe();
    }
  };

  // Handle next recipe navigation
  const handleNextRecipe = () => {
    if (carouselApiRef.current && availableRecipes.length > 1) {
      // Check if we're at the last available recipe
      if (currentIndex >= availableRecipes.length - 1) {
        // Reset to first recipe if we're at the end
        setCurrentIndex(0);
        carouselApiRef.current.scrollTo(0);
      } else {
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

  // Handle restarting the discovery process
  const handleRestart = () => {
    setProcessedRecipeIds(new Set());
    setTotalRecipesProcessed(0);
    setCurrentIndex(0);
    if (carouselApiRef.current) {
      carouselApiRef.current.scrollTo(0);
    }
    toast({
      title: "Discovery restarted! 🔄",
      description: "Starting fresh with all recipes available again.",
      duration: 2000,
    });
  };

  // Handle keyboard navigation (removed backward navigation)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        event.preventDefault();
        handleSkipRecipe();
      } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        event.preventDefault();
        handleSaveToMealPlan();
      } else if (event.key === 'l' || event.key === 'L') {
        event.preventDefault();
        if (availableRecipes && availableRecipes.length > 0) {
          const currentRecipe = availableRecipes[currentIndex];
          if (currentRecipe) {
            handleLike(currentRecipe.id);
          }
        }
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, availableRecipes]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto p-4 pt-20">
          <PageHeaderSkeleton />
          <CarouselSkeleton />
        </div>
      </div>
    );
  }

  // Show a message if no recipes are available (either none found or all processed)
  const noRecipesAvailable = availableRecipes.length === 0;
  
  // Calculate progress based on total recipes found
  const progressPercentage = totalRecipesFound > 0 ? (totalRecipesProcessed / totalRecipesFound) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header Section */}
      <div className="container mx-auto px-4 pt-20 pb-4">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/images/pantry-logo.svg" 
              alt="PantryPal Logo" 
              className="w-10 h-12 mr-3"
            />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-orange-600">
              {selectedIngredients.length > 0 ? 'Recipes Based on Your Ingredients' : 'Discover Amazing Recipes'}
          </h1>
          </div>
          
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            {selectedIngredients.length > 0 
              ? 'Make decisions on recipes that match your available ingredients'
              : 'Discover and decide on amazing recipes'}
          </p>
          
          {/* Progress Bar */}
          {totalRecipesFound > 0 && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>
                  {availableRecipes.length > 0 
                    ? `Recipe ${currentIndex + 1} of ${availableRecipes.length} remaining`
                    : `All ${totalRecipesFound} recipes processed`
                  }
                </span>
                <span>{Math.round(progressPercentage)}% complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {totalRecipesProcessed} recipes processed • {availableRecipes.length} remaining
              </div>
            </div>
          )}
          
          {/* Meal Type Filter */}
          <div className="flex justify-center flex-wrap gap-2 mt-6">
            {(['any', 'main course', 'side dish', 'appetizer', 'breakfast', 'dessert', 'snack', 'drink'] as MealType[]).map(type => (
              <Button
                key={type}
                variant={selectedMealType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMealType(type)}
                className="capitalize text-xs md:text-sm"
              >
                {type === 'any' ? 'All Types' : type.replace('-', ' ')}
              </Button>
            ))}
          </div>
          
          {/* Display dietary preferences if any are selected */}
          {dietaryPreferences.length > 0 && (
            <div className="flex justify-center flex-wrap gap-2 mt-4">
              {dietaryPreferences.map(pref => (
                <span key={pref} className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs md:text-sm font-medium text-orange-800">
                  {pref}
                </span>
              ))}
            </div>
          )}
        </div>
        </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        {noRecipesAvailable ? (
          <div className="text-center p-8 bg-white rounded-lg shadow-sm border max-w-md mx-auto">
            <div className="mb-4">
              <img 
                src="/images/pantry-logo.svg" 
                alt="PantryPal Logo" 
                className="w-16 h-16 mx-auto"
              />
            </div>
            <h3 className="text-xl font-medium mb-4">
              {totalRecipesFound === 0 ? 'No matching recipes found' : 'All recipes processed!'}
            </h3>
            <p className="text-muted-foreground mb-6 text-sm">
              {totalRecipesFound === 0 
                ? 'We couldn\'t find any recipes that match your current dietary preferences. Try adjusting your preferences or ingredients to see more options.'
                : `Great job! You've made decisions on all ${totalRecipesFound} recipes. You can restart to go through them again or update your preferences for new recipes.`
              }
            </p>
            <div className="space-y-3">
              {totalRecipesFound > 0 && (
                <Button onClick={handleRestart} className="w-full">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
              )}
              <Button onClick={handleGoToPreferences} variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
              Update Preferences
            </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Desktop/Tablet Layout */}
            <div className="hidden md:block">
              <Carousel
                className="w-full"
                opts={{
                  align: "center",
                  loop: false, // Disable looping for one-way experience
                  skipSnaps: false,
                  startIndex: currentIndex,
                }}
                setApi={setCarouselApi}
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {availableRecipes.map((recipe: RecipeDetail, index: number) => (
                    <CarouselItem key={recipe.id} className="pl-2 md:pl-4 basis-full">
                      <div className="p-2">
                        <Card className="overflow-hidden">
                          <RecipeCard 
                            recipe={recipe}
                            onLike={handleLike}
                            onViewDetails={handleViewDetails}
                            isLiked={mealPlan.some(r => r.id === recipe.id)}
                          />
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                
                {/* Desktop Navigation - Only forward action buttons */}
                <div className="flex justify-center items-center gap-6 mt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleSkipRecipe}
                    className="flex items-center gap-3 bg-white hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 min-w-[120px]"
                  >
                    <X className="h-5 w-5" />
                    Skip
                  </Button>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="hidden lg:block">Keyboard:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">←</kbd>
                    <span className="text-xs">skip</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">→</kbd>
                    <span className="text-xs">save</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">R</kbd>
                    <span className="text-xs">restart</span>
                  </div>
                  
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handleSaveToMealPlan}
                    className="flex items-center gap-3 bg-green-600 hover:bg-green-700 min-w-[120px]"
                  >
                    <Plus className="h-5 w-5" />
                    Add to Plan
                  </Button>
                </div>
              </Carousel>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
            <Carousel
              className="w-full"
              opts={{
                  align: "center",
                  loop: false, // Disable looping for one-way experience
                  skipSnaps: false,
                  startIndex: currentIndex,
              }}
              setApi={setCarouselApi}
            >
                <CarouselContent className="-ml-2">
                  {availableRecipes.map((recipe: RecipeDetail, index: number) => (
                    <CarouselItem key={recipe.id} className="pl-2 basis-full">
                      <div className="p-2">
                      <Card className="overflow-hidden">
                        <RecipeCard 
                          recipe={recipe}
                          onLike={handleLike}
                          onViewDetails={handleViewDetails}
                            isLiked={mealPlan.some(r => r.id === recipe.id)}
                        />
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              </Carousel>
              
              {/* Mobile Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-6 px-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSkipRecipe}
                  className="flex items-center justify-center gap-2 bg-white border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-14"
                >
                  <X className="h-6 w-6" />
                  <span className="font-medium">Skip</span>
                </Button>
                
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleSaveToMealPlan}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 h-14"
                >
                  <Plus className="h-6 w-6" />
                  <span className="font-medium">Add to Plan</span>
                </Button>
              </div>
            
              {/* Mobile instruction text */}
            <div className="text-center mt-4 text-sm text-muted-foreground">
                <p>Make a decision on each recipe • No going back!</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats - Updated to show processing progress */}
        {totalRecipesFound > 0 && (
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="text-lg font-bold">{totalRecipesFound}</div>
                <div className="text-sm text-muted-foreground">Total Found</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-lg font-bold">{totalRecipesProcessed}</div>
                <div className="text-sm text-muted-foreground">Processed</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-lg font-bold">{availableRecipes.length}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-lg font-bold">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-12 space-y-4">
          {availableRecipes.length > 0 && totalRecipesProcessed > 0 && (
            <Button onClick={handleRestart} variant="outline" size="lg">
              <RotateCcw className="mr-2 h-5 w-5" />
              Start Over
            </Button>
          )}
          <div>
            <Button onClick={handleGoToPreferences} variant="outline" size="lg">
              <Plus className="mr-2 h-5 w-5" />
            Update Preferences
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 