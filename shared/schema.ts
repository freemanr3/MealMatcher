import { pgTable, text, serial, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  ingredients: jsonb("ingredients").default([]).notNull(),
  budget: real("budget").default(0).notNull(),
  dietaryPreferences: jsonb("dietary_preferences").default([]).notNull(),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  imageType: text("image_type").notNull(),
  usedIngredientCount: integer("used_ingredient_count").notNull(),
  missedIngredientCount: integer("missed_ingredient_count").notNull(),
  missedIngredients: jsonb("missed_ingredients").notNull(),
  usedIngredients: jsonb("used_ingredients").notNull(),
  unusedIngredients: jsonb("unused_ingredients").notNull(),
  likes: integer("likes").notNull(),
  servings: integer("servings").notNull(),
  readyInMinutes: integer("ready_in_minutes").notNull(),
  instructions: text("instructions").notNull(),
  summary: text("summary").notNull(),
  cuisines: jsonb("cuisines").notNull(),
  dishTypes: jsonb("dish_types").notNull(),
  diets: jsonb("diets").notNull(),
  extendedIngredients: jsonb("extended_ingredients").notNull(),
  estimatedCost: real("estimated_cost").notNull(),
  cookingTime: integer("cooking_time").notNull(),
  dietaryTags: jsonb("dietary_tags").notNull(),
});

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recipeId: integer("recipe_id").notNull(),
  plannedDate: text("planned_date").notNull(),
});

export const dietaryPreferenceSchema = z.enum([
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "low-carb",
  "keto",
  "paleo"
]);

export type DietaryPreference = z.infer<typeof dietaryPreferenceSchema>;

// Use default createInsertSchema without additional refinements
export const insertUserSchema = createInsertSchema(users);
export const insertRecipeSchema = createInsertSchema(recipes);
export const insertMealPlanSchema = createInsertSchema(mealPlans);

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type MealPlan = typeof mealPlans.$inferSelect;

// Additional types for the client
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
