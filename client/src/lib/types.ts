import type { AnalyzedInstruction, DietaryPreference as SharedDietaryPreference } from '@shared/schema';

export interface Recipe {
  id: number;
  title: string;
  description: string;
  image: string;
  imageType: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: any[];
  usedIngredients: any[];
  unusedIngredients: any[];
  likes: number;
  servings: number;
  readyInMinutes: number;
  instructions: string;
  summary: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  extendedIngredients: any[];
  estimatedCost: number;
  cookingTime: number;
  dietaryTags: string[];
}

// Type that directly maps to Spoonacular API response
export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: any[];
  usedIngredients: any[];
  unusedIngredients: any[];
  likes: number;
  summary?: string;
  servings?: number;
  readyInMinutes?: number;
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
  instructions?: string;
  analyzedInstructions?: AnalyzedInstruction[];
  extendedIngredients?: any[];
  spoonacularScore?: number;
  healthScore?: number;
  pricePerServing?: number;
  sourceUrl?: string;
  cheap?: boolean;
  creditsText?: string;
  dairyFree?: boolean;
  gaps?: string;
  glutenFree?: boolean;
  lowFodmap?: boolean;
  sustainable?: boolean;
  vegan?: boolean;
  vegetarian?: boolean;
  veryHealthy?: boolean;
  veryPopular?: boolean;
  whole30?: boolean;
  weightWatcherSmartPoints?: number;
}

// Simplify by reusing shared type
export type DietaryPreference = SharedDietaryPreference;

export interface User {
  id: string;
  budget: number;
  ingredients: string[];
  dietaryPreferences: DietaryPreference[];
} 