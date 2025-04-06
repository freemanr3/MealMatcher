import { API_CONFIG } from '@/lib/api-config';

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

export interface AnalyzedInstruction {
  name: string;
  steps: {
    number: number;
    step: string;
    ingredients: {
      id: number;
      name: string;
      image: string;
    }[];
    equipment: {
      id: number;
      name: string;
      image: string;
      temperature?: {
        number: number;
        unit: string;
      };
    }[];
    length?: {
      number: number;
      unit: string;
    };
  }[];
}

interface RecipeSearchOptions {
  number?: number;
  ranking?: number;
  maxMissingIngredients?: number;
}

class RecipeService {
  private baseUrl = 'https://api.spoonacular.com/recipes';
  private apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': this.apiKey || '',
    };
  }

  async getRecipesByIngredients(ingredients: string[], options: RecipeSearchOptions = {}): Promise<Recipe[]> {
    const params = new URLSearchParams({
      apiKey: this.apiKey || '',
      ingredients: ingredients.join(','),
      number: (options.number || 10).toString(),
      ranking: (options.ranking || 2).toString(),
      ignorePantry: 'true',
      ...(options.maxMissingIngredients && { limitLicense: options.maxMissingIngredients.toString() }),
    });

    const response = await fetch(
      `${this.baseUrl}/findByIngredients?${params}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }

    return response.json();
  }

  async getRecipeDetails(id: number): Promise<RecipeDetail> {
    const params = new URLSearchParams({
      apiKey: this.apiKey || '',
    });

    const response = await fetch(
      `${this.baseUrl}/${id}/information?${params}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recipe details');
    }

    return response.json();
  }

  async getAnalyzedInstructions(id: number): Promise<AnalyzedInstruction[]> {
    const params = new URLSearchParams({
      apiKey: this.apiKey || '',
      stepBreakdown: 'true',
    });

    const response = await fetch(
      `${this.baseUrl}/${id}/analyzedInstructions?${params}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch analyzed instructions');
    }

    return response.json();
  }

  async getRecipesBulk(ids: number[]): Promise<RecipeDetail[]> {
    const params = new URLSearchParams({
      apiKey: this.apiKey || '',
      ids: ids.join(','),
    });

    const response = await fetch(
      `${this.baseUrl}/informationBulk?${params}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch bulk recipes');
    }

    return response.json();
  }

  async getRandomRecipes(number: number = 10): Promise<RecipeDetail[]> {
    const params = new URLSearchParams({
      apiKey: this.apiKey || '',
      number: number.toString(),
    });

    const response = await fetch(
      `${this.baseUrl}/random?${params}`,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch random recipes');
    }

    return response.json();
  }
}

export const recipeService = new RecipeService(); 