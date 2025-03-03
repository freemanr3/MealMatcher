import { User, Recipe, MealPlan, InsertUser, type DietaryPreference } from "@shared/schema";
import { mockRecipes } from "@/lib/mock-data";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserIngredients(id: number, ingredients: string[]): Promise<User>;
  updateUserBudget(id: number, budget: number): Promise<User>;
  updateUserPreferences(id: number, preferences: DietaryPreference[]): Promise<User>;

  // Recipe operations
  getRecipes(): Promise<Recipe[]>;
  getRecipeById(id: number): Promise<Recipe | undefined>;

  // Meal plan operations
  getMealPlans(userId: number): Promise<MealPlan[]>;
  addMealPlan(userId: number, recipeId: number, date: string): Promise<MealPlan>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private recipes: Map<number, Recipe>;
  private mealPlans: Map<number, MealPlan>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.recipes = new Map();
    this.mealPlans = new Map();
    this.currentId = 1;

    // Initialize with mock recipes
    mockRecipes.forEach(recipe => {
      this.recipes.set(recipe.id, recipe);
      if (recipe.id >= this.currentId) {
        this.currentId = recipe.id + 1;
      }
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentId++;
    const newUser = {
      id,
      ingredients: user.ingredients || [],
      budget: user.budget || 0,
      dietaryPreferences: user.dietaryPreferences || [],
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUserIngredients(id: number, ingredients: string[]): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, ingredients };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserBudget(id: number, budget: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, budget };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserPreferences(id: number, preferences: DietaryPreference[]): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const updatedUser = { ...user, dietaryPreferences: preferences };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipeById(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async getMealPlans(userId: number): Promise<MealPlan[]> {
    return Array.from(this.mealPlans.values())
      .filter(plan => plan.userId === userId);
  }

  async addMealPlan(userId: number, recipeId: number, date: string): Promise<MealPlan> {
    const id = this.currentId++;
    const mealPlan = { id, userId, recipeId, plannedDate: date };
    this.mealPlans.set(id, mealPlan);
    return mealPlan;
  }
}

export const storage = new MemStorage();