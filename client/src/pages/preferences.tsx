import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { IngredientInput } from "@/components/ingredient-input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { API_CONFIG } from "@/lib/api-config";

// Define types locally until shared schema is set up
type DietaryPreference = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'low-carb' | 'keto' | 'paleo';

interface User {
  id: string;
  budget: number;
  ingredients: string[];
  dietaryPreferences: DietaryPreference[];
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

export default function Preferences() {
  const { toast } = useToast();
  const [budget, setBudget] = useState<string>("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([]);
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/users/1"],
    queryFn: async () => {
      const response = await fetch("/api/users/1", API_CONFIG);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setBudget(data.budget.toString());
      setIngredients(data.ingredients);
      setDietaryPreferences(data.dietaryPreferences);
      return data;
    }
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async (newBudget: number) => {
      const res = await apiRequest("PATCH", "/api/users/1/budget", { budget: newBudget });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1"] });
      toast({
        title: "Budget updated",
        description: "Your budget has been successfully updated.",
      });
    },
  });

  const updateIngredientsMutation = useMutation({
    mutationFn: async (newIngredients: string[]) => {
      const res = await apiRequest("PATCH", "/api/users/1/ingredients", { ingredients: newIngredients });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1"] });
      toast({
        title: "Ingredients updated",
        description: "Your ingredients list has been successfully updated.",
      });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: DietaryPreference[]) => {
      const res = await apiRequest("PATCH", "/api/users/1/preferences", { preferences: newPreferences });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1"] });
      toast({
        title: "Preferences updated",
        description: "Your dietary preferences have been successfully updated.",
      });
    },
  });

  const handleBudgetSubmit = () => {
    const numBudget = parseFloat(budget);
    if (!isNaN(numBudget) && numBudget >= 0) {
      updateBudgetMutation.mutate(numBudget);
    }
  };

  const handleDietaryToggle = (preference: DietaryPreference) => {
    const newPreferences = dietaryPreferences.includes(preference)
      ? dietaryPreferences.filter(p => p !== preference)
      : [...dietaryPreferences, preference];
    setDietaryPreferences(newPreferences);
    updatePreferencesMutation.mutate(newPreferences);
  };

  const handleIngredientsChange = (newIngredients: string[]) => {
    setIngredients(newIngredients);
    // In a real app, we'd save this to local storage or backend
    localStorage.setItem('availableIngredients', JSON.stringify(newIngredients));
  };

  const handleQuickAdd = (ingredient: string) => {
    if (!ingredients.includes(ingredient)) {
      const newIngredients = [...ingredients, ingredient];
      handleIngredientsChange(newIngredients);
    }
  };

  const handleSave = () => {
    toast({
      title: 'Preferences Saved',
      description: 'Your ingredients have been updated successfully.',
    });
    setLocation('/swipe');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold ml-2">Preferences</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="budget">Weekly Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>
                <Button
                  className="self-end"
                  onClick={handleBudgetSubmit}
                  disabled={updateBudgetMutation.isPending}
                >
                  Save Budget
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <IngredientInput
                onIngredientsChange={handleIngredientsChange}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dietary Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DIETARY_OPTIONS.map(({ label, value }) => (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={value}
                      checked={dietaryPreferences.includes(value)}
                      onCheckedChange={() => handleDietaryToggle(value)}
                    />
                    <Label htmlFor={value}>{label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {Object.entries(INGREDIENT_SUGGESTIONS).map(([category, items]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {items.map((ingredient) => (
                      <Button
                        key={ingredient}
                        variant="outline"
                        size="sm"
                        className={`rounded-full ${
                          ingredients.includes(ingredient)
                            ? 'bg-primary text-primary-foreground'
                            : ''
                        }`}
                        onClick={() => handleQuickAdd(ingredient)}
                      >
                        {ingredient}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleSave}>
              Start Swiping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
