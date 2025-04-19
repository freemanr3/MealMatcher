import { z } from "zod";

// Types that don't depend on drizzle-orm
export type DietaryPreference = 
  | "vegetarian"
  | "vegan"
  | "gluten-free" 
  | "dairy-free"
  | "low-carb"
  | "keto"
  | "paleo";

// Manually defined types for client use
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

export interface MealPlan {
  id: number;
  userId: number;
  recipeId: number;
  plannedDate: string;
}

export interface MealPlanWithRecipe {
  id: number;
  userId: number;
  recipeId: number;
  plannedDate: string;
  recipe: Recipe;
}

export const ingredientSchema = z.object({
  id: z.number(),
  amount: z.number(),
  unit: z.string(),
  unitLong: z.string(),
  unitShort: z.string(),
  aisle: z.string(),
  name: z.string(),
  original: z.string(),
  originalName: z.string(),
  meta: z.array(z.string()),
  image: z.string(),
});

export const extendedIngredientSchema = ingredientSchema.extend({
  original: z.string(),
  originalName: z.string(),
  aisle: z.string(),
});

export const analyzedInstructionSchema = z.object({
  name: z.string(),
  steps: z.array(z.object({
    number: z.number(),
    step: z.string(),
    ingredients: z.array(z.object({
      id: z.number(),
      name: z.string(),
      image: z.string(),
    })),
    equipment: z.array(z.object({
      id: z.number(),
      name: z.string(),
      image: z.string(),
      temperature: z.object({
        number: z.number(),
        unit: z.string(),
      }).optional(),
    })),
    length: z.object({
      number: z.number(),
      unit: z.string(),
    }).optional(),
  })),
});

export type Ingredient = z.infer<typeof ingredientSchema>;
export type ExtendedIngredient = z.infer<typeof extendedIngredientSchema>;
export type AnalyzedInstruction = z.infer<typeof analyzedInstructionSchema>;

// Spoonacular API types that directly match the API response structure
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
  extendedIngredients?: ExtendedIngredient[];
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