import { API_ENDPOINTS, API_BASE_URLS, getHeaders, getFullUrl } from '@/config/api';
import type { AnalyzedInstruction, ExtendedIngredient, Ingredient } from '@/shared/client-schema';
import type { Recipe, SpoonacularRecipe } from '@/lib/types';

// Re-export Recipe type for components to use
export type { Recipe };

export interface RecipeSearchOptions {
  number?: number;
  ranking?: number;
  maxMissingIngredients?: number;
  ignorePantry?: boolean;
}

// RecipeDetail extends Recipe with additional fields
export interface RecipeDetail extends Recipe {
  servings: number;
  readyInMinutes: number;
  instructions: string;
  summary: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  extendedIngredients: ExtendedIngredient[];
}

// Transform Spoonacular API response to our Recipe type
const transformSpoonacularRecipe = (data: SpoonacularRecipe): Recipe => {
  return {
    id: data.id,
    title: data.title,
    description: data.summary || '',
    image: data.image,
    imageType: data.imageType,
    usedIngredientCount: data.usedIngredientCount,
    missedIngredientCount: data.missedIngredientCount,
    missedIngredients: data.missedIngredients || [],
    usedIngredients: data.usedIngredients || [],
    unusedIngredients: data.unusedIngredients || [],
    likes: data.likes || 0,
    servings: data.servings || 4,
    readyInMinutes: data.readyInMinutes || 30,
    instructions: data.instructions || '',
    summary: data.summary || '',
    cuisines: data.cuisines || [],
    dishTypes: data.dishTypes || [],
    diets: data.diets || [],
    extendedIngredients: data.extendedIngredients || [],
    // Derived or default values
    estimatedCost: data.pricePerServing ? data.pricePerServing / 100 * (data.servings || 4) : 10.99,
    cookingTime: data.readyInMinutes || 30,
    dietaryTags: [
      ...(data.diets || []),
      ...(data.dairyFree ? ['dairy-free'] : []),
      ...(data.glutenFree ? ['gluten-free'] : []),
      ...(data.vegan ? ['vegan'] : []),
      ...(data.vegetarian ? ['vegetarian'] : []),
      ...(data.lowFodmap ? ['low-fodmap'] : [])
    ]
  };
};

class RecipeService {
  async getRecipesByIngredients(ingredients: string[], options: RecipeSearchOptions = {}): Promise<Recipe[]> {
    const params = new URLSearchParams({
      ingredients: ingredients.join(','),
      number: (options.number || 10).toString(),
      ranking: (options.ranking || 2).toString(),
      ignorePantry: 'true',
      ...(options.maxMissingIngredients && { limitLicense: options.maxMissingIngredients.toString() }),
    });

    const url = getFullUrl(
      `${API_ENDPOINTS.RECIPES.SPOONACULAR.SEARCH_BY_INGREDIENTS}?${params}`,
      API_BASE_URLS.SPOONACULAR
    );

    const response = await fetch(url, {
      headers: getHeaders('spoonacular'),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }

    const data = await response.json() as SpoonacularRecipe[];
    return data.map(transformSpoonacularRecipe);
  }

  // Alias method for backward compatibility
  async searchByIngredients(ingredients: string[], options: RecipeSearchOptions = {}): Promise<Recipe[]> {
    return this.getRecipesByIngredients(ingredients, options);
  }

  async getRecipeDetails(id: number): Promise<RecipeDetail> {
    const url = getFullUrl(
      API_ENDPOINTS.RECIPES.SPOONACULAR.RECIPE_DETAILS(id),
      API_BASE_URLS.SPOONACULAR
    );

    const response = await fetch(url, {
      headers: getHeaders('spoonacular'),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recipe details');
    }

    const data = await response.json() as SpoonacularRecipe;
    return transformSpoonacularRecipe(data) as RecipeDetail;
  }

  async getAnalyzedInstructions(id: number): Promise<AnalyzedInstruction[]> {
    const url = getFullUrl(
      API_ENDPOINTS.RECIPES.SPOONACULAR.ANALYZED_INSTRUCTIONS(id),
      API_BASE_URLS.SPOONACULAR
    );

    const response = await fetch(url, {
      headers: getHeaders('spoonacular'),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recipe instructions');
    }

    return response.json();
  }

  async getRecipesBulk(ids: number[]): Promise<RecipeDetail[]> {
    const params = new URLSearchParams({
      ids: ids.join(','),
    });

    const url = getFullUrl(
      `${API_ENDPOINTS.RECIPES.SPOONACULAR.BULK_INFORMATION}?${params}`,
      API_BASE_URLS.SPOONACULAR
    );

    const response = await fetch(url, {
      headers: getHeaders('spoonacular'),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recipes in bulk');
    }

    const data = await response.json() as SpoonacularRecipe[];
    return data.map(recipe => transformSpoonacularRecipe(recipe) as RecipeDetail);
  }

  async getRandomRecipes(number: number = 10): Promise<RecipeDetail[]> {
    const params = new URLSearchParams({
      number: number.toString(),
      tags: 'main course',
    });

    const url = getFullUrl(
      `${API_ENDPOINTS.RECIPES.SPOONACULAR.RANDOM}?${params}`,
      API_BASE_URLS.SPOONACULAR
    );

    const response = await fetch(url, {
      headers: getHeaders('spoonacular'),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch random recipes');
    }

    const data = await response.json();
    const recipes = data.recipes as SpoonacularRecipe[];
    return recipes.map(recipe => transformSpoonacularRecipe(recipe) as RecipeDetail);
  }

  // Backend API methods
  async saveRecipe(recipe: Recipe): Promise<Recipe> {
    const url = getFullUrl(API_ENDPOINTS.RECIPES.BACKEND.SAVE);

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders('default'),
      body: JSON.stringify(recipe),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to save recipe');
    }

    return response.json();
  }

  async deleteRecipe(id: number): Promise<void> {
    const url = getFullUrl(API_ENDPOINTS.RECIPES.BACKEND.DELETE(id));

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders('default'),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete recipe');
    }
  }
}

export const recipeService = new RecipeService(); 