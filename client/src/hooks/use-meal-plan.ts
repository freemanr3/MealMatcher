import { useState, useEffect, useCallback, useRef } from 'react';
import type { RecipeDetail } from '@/services/recipeService';

// Default budget value
const DEFAULT_BUDGET = 100;

// Type for skipped recipe metadata
type SkippedRecipeMetadata = {
  id: number;
  timestamp: number;
  ingredients: string[];
};

// Debounce utility for localStorage operations
const useDebounceCallback = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

// Async localStorage operations to prevent UI blocking
const asyncLocalStorage = {
  async setItem(key: string, value: string): Promise<void> {
    return new Promise((resolve) => {
      requestIdleCallback(() => {
        try {
          localStorage.setItem(key, value);
          resolve();
        } catch (error) {
          console.error(`Failed to save ${key} to localStorage:`, error);
          resolve(); // Don't throw, just log the error
        }
      });
    });
  },

  async getItem(key: string): Promise<string | null> {
    return new Promise((resolve) => {
      requestIdleCallback(() => {
        try {
          const value = localStorage.getItem(key);
          resolve(value);
        } catch (error) {
          console.error(`Failed to get ${key} from localStorage:`, error);
          resolve(null);
        }
      });
    });
  }
};

export function useMealPlan() {
  const [mealPlan, setMealPlan] = useState<RecipeDetail[]>([]);
  const [skippedRecipes, setSkippedRecipes] = useState<SkippedRecipeMetadata[]>([]);
  const [budget, setBudgetState] = useState<number>(DEFAULT_BUDGET);
  const [spent, setSpent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Debounced save functions
  const debouncedSaveMealPlan = useDebounceCallback(async (recipes: RecipeDetail[]) => {
    await asyncLocalStorage.setItem('savedRecipes', JSON.stringify(recipes));
  }, 500);

  const debouncedSaveSkippedRecipes = useDebounceCallback(async (skipped: SkippedRecipeMetadata[]) => {
    await asyncLocalStorage.setItem('skippedRecipes', JSON.stringify(skipped));
  }, 500);

  const debouncedSaveBudget = useDebounceCallback(async (budgetValue: number) => {
    await asyncLocalStorage.setItem('userBudget', budgetValue.toString());
  }, 1000);

  // Load meal plan data from localStorage on component mount
  useEffect(() => {
    const loadMealPlan = async () => {
      try {
        setIsLoading(true);
        
        // Load all data in parallel
        const [savedRecipesStr, skippedStr, budgetStr] = await Promise.all([
          asyncLocalStorage.getItem('savedRecipes'),
          asyncLocalStorage.getItem('skippedRecipes'),
          asyncLocalStorage.getItem('userBudget')
        ]);

        // Parse and set saved recipes
        const savedRecipes = savedRecipesStr ? JSON.parse(savedRecipesStr) : [];
        setMealPlan(savedRecipes);
        
        // Parse and set skipped recipes
        const skipped = skippedStr ? JSON.parse(skippedStr) : [];
        setSkippedRecipes(skipped);
        
        // Parse and set budget
        const savedBudget = budgetStr ? Number(budgetStr) : DEFAULT_BUDGET;
        setBudgetState(savedBudget);
        
        // Calculate total spent
        const totalSpent = savedRecipes.reduce((acc: number, recipe: RecipeDetail) => 
          acc + (recipe.estimatedCost || 0), 0);
        setSpent(totalSpent);
      } catch (error) {
        console.error('Failed to load meal plan data:', error);
        // Set defaults on error
        setMealPlan([]);
        setSkippedRecipes([]);
        setBudgetState(DEFAULT_BUDGET);
        setSpent(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadMealPlan();
  }, []);

  // Update budget setting
  const setBudget = useCallback((newBudget: number) => {
    setBudgetState(newBudget);
    debouncedSaveBudget(newBudget);
  }, [debouncedSaveBudget]);

  // Add a recipe to the meal plan
  const addToMealPlan = useCallback((recipe: RecipeDetail) => {
    setMealPlan(prevRecipes => {
      // Check if the recipe is already in the meal plan
      if (prevRecipes.some(r => r.id === recipe.id)) {
        return prevRecipes;
      }
      
      // Add the new recipe to the meal plan
      const updatedRecipes = [...prevRecipes, recipe];
      
      // Debounced save to localStorage
      debouncedSaveMealPlan(updatedRecipes);
      
      return updatedRecipes;
    });
    
    // Update total spent
    setSpent(prev => prev + (recipe.estimatedCost || 0));
    
    // Remove from skipped recipes if it exists there
    setSkippedRecipes(prev => {
      const filtered = prev.filter(r => r.id !== recipe.id);
      if (filtered.length !== prev.length) {
        debouncedSaveSkippedRecipes(filtered);
      }
      return filtered;
    });
    
    return true; // Return true to indicate successful addition
  }, [debouncedSaveMealPlan, debouncedSaveSkippedRecipes]);

  // Skip a recipe (add to skipped recipes)
  const skipRecipe = useCallback((recipe: RecipeDetail) => {
    setSkippedRecipes(prev => {
    // Check if recipe is already in skipped recipes
      if (prev.some(r => r.id === recipe.id)) {
        return prev;
      }

      const skippedMetadata: SkippedRecipeMetadata = {
        id: recipe.id,
        timestamp: Date.now(),
        ingredients: (recipe.extendedIngredients || []).map(ing => 
          (typeof ing === 'object' && ing.name) ? ing.name.toLowerCase() : ''
        ).filter(Boolean)
      };
      
      const updatedSkippedRecipes = [...prev, skippedMetadata];
      debouncedSaveSkippedRecipes(updatedSkippedRecipes);
      return updatedSkippedRecipes;
    });
    return true;
  }, [debouncedSaveSkippedRecipes]);

  // Remove a recipe from the meal plan
  const removeFromMealPlan = useCallback((recipe: RecipeDetail | number) => {
    const recipeId = typeof recipe === 'number' ? recipe : recipe.id;
    
    setMealPlan(prevRecipes => {
      // Find the recipe to calculate cost reduction
      const recipeToRemove = prevRecipes.find(r => r.id === recipeId);
      
      // Update spent amount
      if (recipeToRemove) {
        setSpent(prev => Math.max(0, prev - (recipeToRemove.estimatedCost || 0)));
      }
      
      const updatedRecipes = prevRecipes.filter(r => r.id !== recipeId);
      
      // Debounced save to localStorage
      debouncedSaveMealPlan(updatedRecipes);
      
      return updatedRecipes;
    });
  }, [debouncedSaveMealPlan]);
  
  // Clear all recipes from meal plan
  const clearMealPlan = useCallback(() => {
    setMealPlan([]);
    setSpent(0);
    debouncedSaveMealPlan([]);
  }, [debouncedSaveMealPlan]);

  // Check if a recipe is in the meal plan
  const isInMealPlan = useCallback((recipeId: number) => {
    return mealPlan.some(recipe => recipe.id === recipeId);
  }, [mealPlan]);

  // Check if a recipe has been skipped and should be shown based on ingredients
  const shouldShowSkippedRecipe = useCallback((recipe: RecipeDetail) => {
    const skippedRecipe = skippedRecipes.find(r => r.id === recipe.id);
    if (!skippedRecipe) return true;

    // Get current recipe ingredients
    const currentIngredients = (recipe.extendedIngredients || []).map(ing => 
      (typeof ing === 'object' && ing.name) ? ing.name.toLowerCase() : ''
    ).filter(Boolean);
    
    // Check if any ingredients match
    const hasMatchingIngredients = skippedRecipe.ingredients.some(ingredient =>
      currentIngredients.some(currentIng => currentIng.includes(ingredient))
    );

    // If ingredients match, remove from skipped recipes
    if (hasMatchingIngredients) {
      setSkippedRecipes(prev => {
        const filtered = prev.filter(r => r.id !== recipe.id);
        debouncedSaveSkippedRecipes(filtered);
        return filtered;
      });
      return true;
    }

    return false;
  }, [skippedRecipes, debouncedSaveSkippedRecipes]);

  // Clear skipped recipes
  const clearSkippedRecipes = useCallback(() => {
    setSkippedRecipes([]);
    debouncedSaveSkippedRecipes([]);
  }, [debouncedSaveSkippedRecipes]);

  return {
    mealPlan,
    budget,
    spent,
    isLoading,
    addToMealPlan,
    skipRecipe, 
    removeFromMealPlan,
    isInMealPlan,
    shouldShowSkippedRecipe,
    clearSkippedRecipes,
    clearMealPlan,
    setBudget,
    recipesCount: mealPlan.length,
    budgetPercentage: budget > 0 ? (spent / budget * 100) : 0,
    remaining: Math.max(0, budget - spent)
  };
} 