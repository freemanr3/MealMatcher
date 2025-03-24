export interface Recipe {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  ingredients: string[];
  estimatedCost: number;
  cookingTime: number;
  dietaryTags: string[];
}

export type DietaryPreference = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'low-carb' | 'keto' | 'paleo';

export interface User {
  id: string;
  budget: number;
  ingredients: string[];
  dietaryPreferences: DietaryPreference[];
} 