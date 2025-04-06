import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Minus, ChevronLeft, Trash2 } from "lucide-react";
import { IngredientInput } from "@/components/ingredient-input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { API_CONFIG } from "@/lib/api-config";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";

// Define types locally until shared schema is set up
type DietaryPreference = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'low-carb' | 'keto' | 'paleo';

interface User {
  id: string;
  budget: number;
  ingredients: string[];
  dietaryPreferences: DietaryPreference[];
}

interface IngredientWithQuantity {
  name: string;
  quantity: number;
  unit: string;
}

interface Ingredient {
  name: string;
  quantity: string;
}

const DIETARY_OPTIONS: { label: string; value: DietaryPreference }[] = [
  { label: "Vegetarian", value: "vegetarian" },
  { label: "Vegan", value: "vegan" },
  { label: "Gluten-Free", value: "gluten-free" },
  { label: "Dairy-Free", value: "dairy-free" },
  { label: "Low-Carb", value: "low-carb" },
  { label: "Keto", value: "keto" },
  { label: "Paleo", value: "paleo" },
];

// Common ingredients by category
const INGREDIENT_SUGGESTIONS = {
  Proteins: ['chicken', 'beef', 'pork', 'tofu', 'eggs', 'fish'],
  'Grains & Starches': ['rice', 'pasta', 'bread', 'quinoa', 'potatoes'],
  Vegetables: ['tomatoes', 'onions', 'carrots', 'broccoli', 'spinach'],
  Fruits: ['apples', 'bananas', 'oranges', 'berries', 'lemons'],
  'Dairy & Alternatives': ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
  Pantry: ['flour', 'sugar', 'oil', 'vinegar', 'soy sauce'],
};

export function IngredientsPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [newIngredient, setNewIngredient] = useState<Ingredient>({ name: '', quantity: '' });
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  useEffect(() => {
    // Load saved ingredients from localStorage
    const savedIngredients = JSON.parse(localStorage.getItem('selectedIngredients') || '[]');
    setIngredients(savedIngredients);
  }, []);

  const handleAddIngredient = () => {
    if (newIngredient.name && newIngredient.quantity) {
      const updatedIngredients = [...ingredients, newIngredient];
      setIngredients(updatedIngredients);
      localStorage.setItem('selectedIngredients', JSON.stringify(updatedIngredients));
      setNewIngredient({ name: '', quantity: '' });
    }
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
    localStorage.setItem('selectedIngredients', JSON.stringify(updatedIngredients));
    if (selectedIngredient && selectedIngredient === ingredients[index]) {
      setSelectedIngredient(null);
    }
  };

  const handleSelectIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
  };

  const handleSave = () => {
    setLocation('/discover');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link href="/discover">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-4">My Ingredients</h1>
      </div>

      <Card className="p-4 mb-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ingredient">Ingredient</Label>
              <Input
                id="ingredient"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                placeholder="e.g., chicken breast"
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                value={newIngredient.quantity}
                onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                placeholder="e.g., 500g"
              />
            </div>
          </div>
          <Button onClick={handleAddIngredient} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Ingredient
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Ingredients</h2>
        {ingredients.length === 0 ? (
          <Card className="p-4">
            <p className="text-muted-foreground">No ingredients added yet. Add some to get recipe suggestions!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {ingredients.map((ingredient, index) => (
              <Card 
                key={index} 
                className={cn(
                  "p-4 cursor-pointer transition-colors",
                  selectedIngredient?.name === ingredient.name ? "bg-orange-50 border-orange-200" : ""
                )}
                onClick={() => handleSelectIngredient(ingredient)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{ingredient.name}</p>
                    <p className="text-sm text-muted-foreground">{ingredient.quantity}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveIngredient(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button onClick={handleSave} className="w-full">
          Save and Continue
        </Button>
      </div>
    </div>
  );
}
