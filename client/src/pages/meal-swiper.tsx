import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X, Check, DollarSign, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { IngredientsSlider } from '@/components/ingredients-slider';
import { RecipeCard } from '@/components/recipe-card';
import { useIngredients } from '@/hooks/use-ingredients';
import { recipeService, type RecipeDetail } from '@/services/recipeService';
import { useMealPlan } from '@/hooks/use-meal-plan';

const SWIPE_THRESHOLD = 100;

// Card spring animation configuration
const springConfig = {
  type: "spring",
  damping: 18,
  stiffness: 180,
  mass: 1.2
};

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
  const [nextRecipeInQueue, setNextRecipeInQueue] = useState<RecipeDetail | null>(null);
  const [maxIngredients, setMaxIngredients] = useState(3);
  const [selectedCuisine, setSelectedCuisine] = useState<typeof CUISINE_TYPES[number]>('Any');
  const [selectedTime, setSelectedTime] = useState<number>(0);
  const [direction, setDirection] = useState<"right" | "left" | null>(null);
  const [isAnimatingExit, setIsAnimatingExit] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showBudgetInfo, setShowBudgetInfo] = useState(false);
  const { ingredients, hasIngredients } = useIngredients();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { 
    addToMealPlan, skipRecipe, isInMealPlan, shouldShowSkippedRecipe, 
    budget, spent, budgetPercentage, remaining 
  } = useMealPlan();
  
  // Motion values for swipe animations
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  
  // Calculate opacity based on swipe distance for overlay icons
  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const dislikeOpacity = useTransform(x, [-150, 0], [1, 0]);

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
        return shouldShowSkippedRecipe(recipe);
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
    if (initialRecipes?.length) {
      setRecipes(initialRecipes);
      setCurrentIndex(0);
    }
  }, [initialRecipes]);

  useEffect(() => {
    // Load current recipe
    if (recipes.length > 0 && currentIndex < recipes.length) {
      loadRecipeDetails(recipes[currentIndex].id, false);
      
      // Preload next recipe (if available) for smoother transitions
      if (currentIndex + 1 < recipes.length) {
        loadRecipeDetails(recipes[currentIndex + 1].id, true);
      }
    }
  }, [recipes, currentIndex]);

  const loadRecipeDetails = async (recipeId: number, isNextRecipe: boolean) => {
    try {
      const details = await recipeService.getRecipeDetails(recipeId);
      if (isNextRecipe) {
        setNextRecipeInQueue(details);
      } else {
        setCurrentRecipe(details);
      }
    } catch (error) {
      console.error('Failed to load recipe details:', error);
    }
  };

  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50); // Vibrate for 50ms
    }
  };

  // Handle touch start to prevent card swipe from interfering with vertical scroll
  const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // We can't directly set pointer capture in the generic event handler
    // But we can prevent default behavior for touch events
    if (event.type.startsWith('touch')) {
      event.preventDefault();
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    const swipe = info.offset.x;
    
    if (Math.abs(swipe) > SWIPE_THRESHOLD) {
      if (swipe > 0) {
        setDirection("right");
        triggerHapticFeedback();
        handleLike();
      } else {
        setDirection("left");
        triggerHapticFeedback();
        handleDislike();
      }
      setIsAnimatingExit(true);
    }
  };

  const handleLike = () => {
    if (currentRecipe) {
      // Add to meal plan using our custom hook
      const wasAdded = addToMealPlan(currentRecipe);
      
      if (wasAdded) {
        // Show budget info briefly after adding a recipe
        setShowBudgetInfo(true);
        setTimeout(() => setShowBudgetInfo(false), 3000);
        
        toast({
          title: "Recipe Saved!",
          description: `${currentRecipe.title} has been added to your meal plan for $${currentRecipe.estimatedCost.toFixed(2)}`
        });
      }
      
      // Small delay before moving to next recipe to allow for exit animation
      setTimeout(() => {
        advanceToNextRecipe();
      }, 300);
    }
  };

  const handleDislike = () => {
    if (currentRecipe) {
      // Skip the recipe and add it to the end of the queue
      skipRecipe(currentRecipe);
      
      // Add to end of queue (after setTimeout to avoid confusion)
      setTimeout(() => {
        setRecipes(prev => {
          // Remove the current recipe from its current position
          const filtered = prev.filter((_, index) => index !== currentIndex);
          // Add it to the end
          return [...filtered, currentRecipe];
        });
      }, 500);
    }
    
    // Small delay before moving to next recipe to allow for exit animation
    setTimeout(() => {
      advanceToNextRecipe();
    }, 300);
  };

  const advanceToNextRecipe = () => {
    if (currentIndex < recipes.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
      setIsAnimatingExit(false);
      
      // If we've preloaded the next recipe, make it the current one
      if (nextRecipeInQueue) {
        setCurrentRecipe(nextRecipeInQueue);
        setNextRecipeInQueue(null);
      }
    } else {
      toast({
        title: "No More Recipes",
        description: "You've seen all available recipes. Check your meal plan!"
      });
      setDirection(null);
      setIsAnimatingExit(false);
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
    <div className="container mx-auto max-w-xl p-4 overflow-hidden">
      <div className="space-y-6">
        {/* Instructions overlay (shown only on first visit) */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4"
              >
                <h2 className="text-xl font-bold text-center">How To Use</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 bg-green-100 rounded-full">
                      <Check className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-sm">Swipe RIGHT to add recipe to your meal plan</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 bg-red-100 rounded-full">
                      <X className="w-6 h-6 text-red-500" />
                    </div>
                    <p className="text-sm">Swipe LEFT to skip this recipe (it will return later)</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 bg-orange-100 rounded-full">
                      <DollarSign className="w-6 h-6 text-green-700" />
                    </div>
                    <p className="text-sm">Track your meal plan budget as you go</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => setShowInstructions(false)}
                >
                  Got It!
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Budget Tracker Popup */}
        <AnimatePresence>
          {showBudgetInfo && currentRecipe && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-4 shadow-lg z-40 w-[90%] max-w-md"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Meal Budget Updated</h3>
                  <DollarSign className="text-green-600 h-5 w-5" />
                </div>
                
                <Progress value={budgetPercentage} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">Recipe Cost</p>
                    <p className="font-medium">${currentRecipe.estimatedCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Spent</p>
                    <p className="font-medium">${spent.toFixed(2)} of ${budget.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      
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
        
        {/* Budget Quick View */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Meal Plan Budget</span>
            <span className="text-sm font-medium">${spent.toFixed(2)} / ${budget.toFixed(2)}</span>
          </div>
          <Progress value={budgetPercentage} className="h-1.5" />
        </div>

        {/* Recipe Card Stack - Height adjusted for larger card */}
        <div className="relative h-[650px] sm:h-[700px] md:h-[750px] mx-auto touch-none perspective">
          {/* Dummy cards for stack effect - showing multiple cards in background */}
          <div className="absolute inset-0 transform scale-[0.92] -translate-y-1 translate-x-2 rotate-3 bg-gray-100 rounded-xl shadow-sm"></div>
          <div className="absolute inset-0 transform scale-[0.95] -translate-y-2 -translate-x-2 -rotate-2 bg-gray-200 rounded-xl shadow-sm"></div>
          
          {/* Next recipe in queue for smoother transitions */}
          {nextRecipeInQueue && (
            <div className="absolute inset-0 scale-[0.98] -translate-y-1 bg-white rounded-xl shadow-sm"></div>
          )}
          
          {/* Current Recipe Card with Swipe Animation */}
          <AnimatePresence mode="wait">
            {currentRecipe && (
              <motion.div
                key={currentRecipe.id}
                className="absolute inset-0 will-change-transform cursor-grab active:cursor-grabbing touch-none"
                style={{ x, rotate }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={
                  direction === "left"
                    ? { x: -1500, opacity: 0, rotate: -30, transition: springConfig }
                    : direction === "right"
                    ? { x: 1500, opacity: 0, rotate: 30, transition: springConfig }
                    : { opacity: 0 }
                }
                transition={springConfig}
              >
                {/* Like Overlay */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                  style={{ opacity: likeOpacity }}
                >
                  <motion.div 
                    className="bg-green-500/80 p-5 rounded-full shadow-lg"
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200 }}
                  >
                    <Check className="w-20 h-20 text-white" />
                  </motion.div>
                </motion.div>

                {/* Dislike Overlay */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                  style={{ opacity: dislikeOpacity }}
                >
                  <motion.div 
                    className="bg-red-500/80 p-5 rounded-full shadow-lg"
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200 }}
                  >
                    <X className="w-20 h-20 text-white" />
                  </motion.div>
                </motion.div>

                <RecipeCard recipe={currentRecipe} onViewDetails={() => setLocation(`/recipe/${currentRecipe.id}`)} />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Swipe instructions overlay */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none px-4 opacity-60">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 0.7, x: 0 }}
              transition={{ delay: 1 }}
              className="bg-white rounded-full p-4 shadow-lg"
            >
              <ArrowLeft className="h-8 w-8 text-red-500" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 0.7, x: 0 }}
              transition={{ delay: 1 }}
              className="bg-white rounded-full p-4 shadow-lg"
            >
              <ArrowRight className="h-8 w-8 text-green-500" />
            </motion.div>
          </div>
        </div>

        {/* Desktop Control Buttons */}
        <div className="flex justify-center gap-6 mt-6">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full p-6 hover:bg-red-50 transition-colors shadow-sm hover:shadow"
              onClick={() => {
                setDirection("left");
                triggerHapticFeedback();
                handleDislike();
              }}
            >
              <X className="w-8 h-8 text-red-500" />
            </Button>
          </motion.div>
          
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full p-6 hover:bg-green-50 transition-colors shadow-sm hover:shadow"
              onClick={() => {
                setDirection("right");
                triggerHapticFeedback();
                handleLike();
              }}
            >
              <Check className="w-8 h-8 text-green-500" />
            </Button>
          </motion.div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-2">
          <p>Swipe right to add to meal plan, swipe left to skip</p>
          <p className="mt-1 text-xs">Recipes: {currentIndex + 1} of {recipes.length}</p>
        </div>
      </div>
    </div>
  );
}
