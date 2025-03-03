import type { Recipe } from "./schema";

export const mockRecipes: Recipe[] = [
  {
    id: 1,
    name: "Grilled Salmon with Asparagus",
    description: "Fresh salmon fillet with grilled asparagus and lemon butter sauce",
    imageUrl: "https://images.unsplash.com/photo-1543992321-cefacfc2322e",
    ingredients: ["salmon", "asparagus", "lemon", "butter", "garlic"],
    estimatedCost: 15.99,
    cookingTime: 25,
    dietaryTags: ["gluten-free", "low-carb"]
  },
  {
    id: 2,
    name: "Vegetarian Buddha Bowl",
    description: "Quinoa bowl with roasted vegetables and tahini dressing",
    imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
    ingredients: ["quinoa", "sweet potato", "chickpeas", "kale", "tahini"],
    estimatedCost: 12.99,
    cookingTime: 35,
    dietaryTags: ["vegetarian", "vegan", "gluten-free"]
  },
  {
    id: 3,
    name: "Chicken Stir-Fry",
    description: "Quick and healthy chicken stir-fry with mixed vegetables",
    imageUrl: "https://images.unsplash.com/photo-1625937751876-4515cd8e78bd",
    ingredients: ["chicken breast", "broccoli", "carrots", "soy sauce", "rice"],
    estimatedCost: 10.99,
    cookingTime: 20,
    dietaryTags: ["dairy-free"]
  }
];

export const ingredientsList = [
  "chicken breast",
  "salmon",
  "quinoa",
  "rice",
  "pasta",
  "broccoli",
  "carrots",
  "asparagus",
  "sweet potato",
  "kale",
  "chickpeas",
  "eggs",
  "milk",
  "cheese",
  "butter",
  "olive oil",
  "soy sauce",
  "garlic",
  "onions",
  "lemon",
  "tomatoes"
];
