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
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  ingredients: jsonb("ingredients").notNull(),
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

export const insertUserSchema = createInsertSchema(users).pick({
  ingredients: true,
  budget: true,
  dietaryPreferences: true,
});

export const insertRecipeSchema = createInsertSchema(recipes);

export const insertMealPlanSchema = createInsertSchema(mealPlans);

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type MealPlan = typeof mealPlans.$inferSelect;

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
