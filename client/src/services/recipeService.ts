import { API_CONFIG, getApiHeaders } from '@/config/api';

export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: Ingredient[];
  usedIngredients: Ingredient[];
  unusedIngredients: Ingredient[];
  likes: number;
}

export interface Ingredient {
  id: number;
  amount: number;
  unit: string;
  unitLong: string;
  unitShort: string;
  aisle: string;
  name: string;
  original: string;
  originalName: string;
  meta: string[];
  image: string;
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

export interface ExtendedIngredient extends Ingredient {
  original: string;
  originalName: string;
  aisle: string;
}

interface RecipeSearchOptions {
  number?: number;
  ranking?: number;
  maxMissingIngredients?: number;
}

class RecipeService {
  private baseUrl = API_CONFIG.SPOONACULAR_BASE_URL;

  async getRecipesByIngredients(ingredients: string[], options: RecipeSearchOptions = {}): Promise<Recipe[]> {
    const params = new URLSearchParams({
      ingredients: ingredients.join(','),
      number: (options.number || 10).toString(),
      ranking: (options.ranking || 2).toString(),
      ignorePantry: 'true',
      ...(options.maxMissingIngredients && { limitLicense: options.maxMissingIngredients.toString() }),
    });

    const response = await fetch(
      `${this.baseUrl}/recipes/findByIngredients?${params}`,
      { headers: getApiHeaders().headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }

    return response.json();
  }

  async getRecipeDetails(id: number): Promise<RecipeDetail> {
    const response = await fetch(
      `${this.baseUrl}/recipes/${id}/information`,
      { headers: getApiHeaders().headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recipe details');
    }

    return response.json();
  }

  async getRecipesBulk(ids: number[]): Promise<RecipeDetail[]> {
    const params = new URLSearchParams({
      ids: ids.join(','),
    });

    const response = await fetch(
      `${this.baseUrl}/recipes/informationBulk?${params}`,
      { headers: getApiHeaders().headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recipes bulk');
    }

    return response.json();
  }

  async getRandomRecipes(number: number = 10): Promise<RecipeDetail[]> {
    const params = new URLSearchParams({
      number: number.toString(),
    });

    const response = await fetch(
      `${this.baseUrl}/recipes/random?${params}`,
      { headers: getApiHeaders().headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch random recipes');
    }

    const data = await response.json();
    return data.recipes;
  }
}

export const recipeService = new RecipeService(); 