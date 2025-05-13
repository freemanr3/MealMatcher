import { useState, useEffect } from 'react';
import type { RecipeDetail } from '@/services/recipeService';

// Default budget value
const DEFAULT_BUDGET = 100;

export function useMealPlan() {
  const [mealPlan, setMealPlan] = useState<RecipeDetail[]>([]);
  const [skippedRecipes, setSkippedRecipes] = useState<RecipeDetail[]>([]);
  const [budget, setBudget] = useState<number>(DEFAULT_BUDGET);
  const [spent, setSpent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load meal plan data from localStorage on component mount
  useEffect(() => {
    const loadMealPlan = () => {
      try {
        // Load saved recipes
        const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
        setMealPlan(savedRecipes);
        
        // Load skipped recipes
        const skipped = JSON.parse(localStorage.getItem('skippedRecipes') || '[]');
        setSkippedRecipes(skipped);
        
        // Load budget
        const savedBudget = Number(localStorage.getItem('userBudget')) || DEFAULT_BUDGET;
        setBudget(savedBudget);
        
        // Calculate total spent based on saved recipes
        const totalSpent = savedRecipes.reduce((acc: number, recipe: RecipeDetail) => 
          acc + recipe.estimatedCost, 0);
        setSpent(totalSpent);
      } catch (error) {
        console.error('Failed to load meal plan data:', error);
        setMealPlan([]);
        setSkippedRecipes([]);
        setSpent(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadMealPlan();
  }, []);

  // Update budget setting
  const updateBudget = (newBudget: number) => {
    setBudget(newBudget);
    localStorage.setItem('userBudget', newBudget.toString());
    return true;
  };

  // Add a recipe to the meal plan
  const addToMealPlan = (recipe: RecipeDetail) => {
    setMealPlan(prevRecipes => {
      // Check if the recipe is already in the meal plan
      if (prevRecipes.some(r => r.id === recipe.id)) {
        return prevRecipes;
      }
      
      // Add the new recipe to the meal plan
      const updatedRecipes = [...prevRecipes, recipe];
      
      // Save to localStorage
      localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
      
      return updatedRecipes;
    });
    
    // Update total spent
    setSpent(prev => {
      const newSpent = prev + recipe.estimatedCost;
      return newSpent;
    });
    
    // Remove from skipped recipes if it exists there
    setSkippedRecipes(prev => {
      const filtered = prev.filter(r => r.id !== recipe.id);
      localStorage.setItem('skippedRecipes', JSON.stringify(filtered));
      return filtered;
    });
    
    return true; // Return true to indicate successful addition
  };

  // Skip a recipe (add to skipped recipes)
  const skipRecipe = (recipe: RecipeDetail) => {
    // Check if recipe is already in skipped recipes
    if (!skippedRecipes.some(r => r.id === recipe.id)) {
      const updatedSkippedRecipes = [...skippedRecipes, recipe];
      setSkippedRecipes(updatedSkippedRecipes);
      localStorage.setItem('skippedRecipes', JSON.stringify(updatedSkippedRecipes));
    }
    return true;
  };

  // Remove a recipe from the meal plan
  const removeFromMealPlan = (recipe: RecipeDetail | number) => {
    const recipeId = typeof recipe === 'number' ? recipe : recipe.id;
    
    setMealPlan(prevRecipes => {
      // Find the recipe to calculate cost reduction
      const recipeToRemove = prevRecipes.find(r => r.id === recipeId);
      
      // Update spent amount
      if (recipeToRemove) {
        setSpent(prev => prev - recipeToRemove.estimatedCost);
      }
      
      const updatedRecipes = prevRecipes.filter(r => r.id !== recipeId);
      
      // Save to localStorage
      localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
      
      return updatedRecipes;
    });
  };
  
  // Clear all recipes from meal plan
  const clearMealPlan = () => {
    setMealPlan([]);
    setSpent(0);
    localStorage.setItem('savedRecipes', JSON.stringify([]));
  };
  
  // Recover a skipped recipe and add it to meal plan
  const recoverSkippedRecipe = (recipe: RecipeDetail) => {
    // Add to meal plan
    addToMealPlan(recipe);
    
    // Remove from skipped recipes
    setSkippedRecipes(prev => {
      const filtered = prev.filter(r => r.id !== recipe.id);
      localStorage.setItem('skippedRecipes', JSON.stringify(filtered));
      return filtered;
    });
  };

  // Check if a recipe is in the meal plan
  const isInMealPlan = (recipeId: number) => {
    return mealPlan.some(recipe => recipe.id === recipeId);
  };

  // Check if a recipe has been skipped
  const isSkipped = (recipeId: number) => {
    return skippedRecipes.some(recipe => recipe.id === recipeId);
  };

  // Clear skipped recipes
  const clearSkippedRecipes = () => {
    setSkippedRecipes([]);
    localStorage.setItem('skippedRecipes', JSON.stringify([]));
  };

  return {
    mealPlan,
    skippedRecipes,
    budget,
    spent,
    isLoading,
    addToMealPlan,
    skipRecipe, 
    removeFromMealPlan,
    isInMealPlan,
    isSkipped,
    clearSkippedRecipes,
    clearMealPlan,
    recoverSkippedRecipe,
    updateBudget,
    setBudget: updateBudget,
    recipesCount: mealPlan.length,
    budgetPercentage: spent / budget * 100,
    remaining: budget - spent
  };
} 