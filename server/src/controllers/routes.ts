import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRecipeSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // User routes
  app.post("/api/users", async (req, res) => {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid user data" });
    }
    
    const user = await storage.createUser(parsed.data);
    res.json(user);
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.patch("/api/users/:id/ingredients", async (req, res) => {
    const ingredients = req.body.ingredients;
    if (!Array.isArray(ingredients)) {
      return res.status(400).json({ error: "Invalid ingredients array" });
    }
    
    const user = await storage.updateUserIngredients(Number(req.params.id), ingredients);
    res.json(user);
  });

  app.patch("/api/users/:id/budget", async (req, res) => {
    const budget = Number(req.body.budget);
    if (isNaN(budget)) {
      return res.status(400).json({ error: "Invalid budget" });
    }
    
    const user = await storage.updateUserBudget(Number(req.params.id), budget);
    res.json(user);
  });

  app.patch("/api/users/:id/preferences", async (req, res) => {
    const preferences = req.body.preferences;
    if (!Array.isArray(preferences)) {
      return res.status(400).json({ error: "Invalid preferences array" });
    }
    
    const user = await storage.updateUserPreferences(Number(req.params.id), preferences);
    res.json(user);
  });

  // Recipe routes
  app.get("/api/recipes", async (_req, res) => {
    const recipes = await storage.getRecipes();
    res.json(recipes);
  });

  app.get("/api/recipes/:id", async (req, res) => {
    const recipe = await storage.getRecipeById(Number(req.params.id));
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    res.json(recipe);
  });

  // Meal plan routes
  app.get("/api/mealplans/:userId", async (req, res) => {
    const mealPlansWithRecipes = await storage.getMealPlansWithRecipes(Number(req.params.userId));
    res.json(mealPlansWithRecipes);
  });

  app.post("/api/mealplans", async (req, res) => {
    const { userId, recipeId, date } = req.body;
    if (!userId || !recipeId || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const mealPlan = await storage.addMealPlan(userId, recipeId, date);
    res.json(mealPlan);
  });

  return httpServer;
}
