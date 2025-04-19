import { API_ENDPOINTS, API_BASE_URLS, getHeaders, getFullUrl } from '@/config/api';
import type { Recipe, Ingredient, ExtendedIngredient, AnalyzedInstruction } from '@shared/schema';

export type { Recipe, Ingredient, ExtendedIngredient, AnalyzedInstruction };

export interface RecipeSearchOptions {
  number?: number;
  ranking?: number;
  maxMissingIngredients?: number;
}

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

    return response.json();
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

    return response.json();
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

    return response.json();
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

    return response.json().recipes;
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