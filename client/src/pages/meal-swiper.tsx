import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { IngredientsSlider } from '@/components/ingredients-slider';
import { RecipeCard } from '@/components/recipe-card';
import { useIngredients } from '@/hooks/use-ingredients';
import { recipeService, type RecipeDetail } from '@/services/recipeService';

const SWIPE_THRESHOLD = 100;

const CUISINE_TYPES = [
  'Any', 'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'Indian'
] as const;

const COOKING_TIMES = [
  { label: 'Any', value: 0 },
  { label: '< 30 mins', value: 30 },
  { label: '< 45 mins', value: 45 },
  { label: '< 60 mins', value: 60 },
] as const;

export default function MealSwiper() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recipes, setRecipes] = useState<RecipeDetail[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<RecipeDetail | null>(null);
  const [dragX, setDragX] = useState(0);
  const [maxIngredients, setMaxIngredients] = useState(3);
  const [selectedCuisine, setSelectedCuisine] = useState<typeof CUISINE_TYPES[number]>('Any');
  const [selectedTime, setSelectedTime] = useState<number>(0);
  const { ingredients, hasIngredients } = useIngredients();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: initialRecipes, isLoading, refetch } = useQuery({
    queryKey: ['recipes', ingredients, maxIngredients, selectedCuisine, selectedTime],
    queryFn: async () => {
      const recipes = await recipeService.getRecipesByIngredients(ingredients, {
        number: 50,
        ranking: 2,
        maxMissingIngredients: maxIngredients
      });

      // Get detailed information for all recipes
      const detailedRecipes = await recipeService.getRecipesBulk(recipes.map(r => r.id));

      return detailedRecipes.filter(recipe => {
        if (selectedCuisine !== 'Any' && !recipe.cuisines.includes(selectedCuisine)) {
          return false;
        }
        if (selectedTime > 0 && recipe.readyInMinutes > selectedTime) {
          return false;
        }
        return true;
      });
    },
    enabled: hasIngredients,
  });

  useEffect(() => {
    if (!hasIngredients) {
      setLocation('/preferences');
      toast({
        title: "No Ingredients Found",
        description: "Please add some ingredients to start swiping through recipes.",
      });
    }
  }, [hasIngredients, setLocation, toast]);

  useEffect(() => {
    if (initialRecipes) {
      setRecipes(initialRecipes);
      setCurrentIndex(0);
    }
  }, [initialRecipes]);

  useEffect(() => {
    if (recipes.length > 0 && currentIndex < recipes.length) {
      loadRecipeDetails(recipes[currentIndex].id);
    }
  }, [recipes, currentIndex]);

  const loadRecipeDetails = async (recipeId: number) => {
    try {
      const details = await recipeService.getRecipeDetails(recipeId);
      setCurrentRecipe(details);
    } catch (error) {
      console.error('Failed to load recipe details:', error);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    const swipe = info.offset.x;
    if (Math.abs(swipe) > SWIPE_THRESHOLD) {
      if (swipe > 0) {
        handleLike();
      } else {
        handleDislike();
      }
    }
    setDragX(0);
  };

  const handleLike = () => {
    if (currentRecipe) {
      // Save to local storage
      const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      savedRecipes.push(currentRecipe);
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));

      toast({
        title: "Recipe Liked!",
        description: `${currentRecipe.title} has been added to your meal plan.`
      });
      nextRecipe();
    }
  };

  const handleDislike = () => {
    nextRecipe();
  };

  const nextRecipe = () => {
    if (currentIndex < recipes.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      toast({
        title: "No More Recipes",
        description: "You've seen all available recipes. Check your meal plan!"
      });
    }
  };

  const handleMaxIngredientsChange = (value: number) => {
    setMaxIngredients(value);
    refetch();
  };

  if (!hasIngredients) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-md p-4 space-y-4">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {CUISINE_TYPES.map((cuisine) => (
              <Button
                key={cuisine}
                variant={selectedCuisine === cuisine ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCuisine(cuisine);
                  refetch();
                }}
              >
                {cuisine}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {COOKING_TIMES.map((time) => (
              <Button
                key={time.value}
                variant={selectedTime === time.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedTime(time.value);
                  refetch();
                }}
              >
                {time.label}
              </Button>
            ))}
          </div>
        </div>

        <IngredientsSlider
          value={maxIngredients}
          onChange={handleMaxIngredientsChange}
        />

        <AnimatePresence mode="wait">
          {currentRecipe && (
            <motion.div
              key={currentRecipe.id}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: dragX, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              className="will-change-transform"
            >
              <RecipeCard recipe={currentRecipe} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center gap-4 mt-6">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full p-6"
            onClick={handleDislike}
          >
            <X className="w-8 h-8 text-red-500" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full p-6"
            onClick={handleLike}
          >
            <Check className="w-8 h-8 text-green-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
