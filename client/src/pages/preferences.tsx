import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { IngredientInput } from "@/components/ingredient-input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, DietaryPreference } from "@shared/schema";

const DIETARY_OPTIONS: { label: string; value: DietaryPreference }[] = [
  { label: "Vegetarian", value: "vegetarian" },
  { label: "Vegan", value: "vegan" },
  { label: "Gluten-Free", value: "gluten-free" },
  { label: "Dairy-Free", value: "dairy-free" },
  { label: "Low-Carb", value: "low-carb" },
  { label: "Keto", value: "keto" },
  { label: "Paleo", value: "paleo" },
];

export default function Preferences() {
  const { toast } = useToast();
  const [budget, setBudget] = useState<string>("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([]);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/users/1"], // TODO: Get from auth
    onSuccess: (data) => {
      setBudget(data.budget.toString());
      setIngredients(data.ingredients as string[]);
      setDietaryPreferences(data.dietaryPreferences as DietaryPreference[]);
    },
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
                value={ingredients}
                onChange={(newIngredients) => {
                  setIngredients(newIngredients);
                  updateIngredientsMutation.mutate(newIngredients);
                }}
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
        </div>
      </div>
    </div>
  );
}
