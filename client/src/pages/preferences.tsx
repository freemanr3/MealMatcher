import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Minus, ChevronLeft, Trash2, Search, Apple, Beef, Egg, Wheat, Coffee, Carrot } from "lucide-react";
import { IngredientInput } from "@/components/ingredient-input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { API_CONFIG } from "@/lib/api-config";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

const DIETARY_OPTIONS: { label: string; value: DietaryPreference; icon: React.ReactNode }[] = [
  { label: "Vegetarian", value: "vegetarian", icon: <Carrot className="h-4 w-4" /> },
  { label: "Vegan", value: "vegan", icon: <Wheat className="h-4 w-4" /> },
  { label: "Gluten-Free", value: "gluten-free", icon: <Wheat className="h-4 w-4 text-red-500" /> },
  { label: "Dairy-Free", value: "dairy-free", icon: <Egg className="h-4 w-4 text-red-500" /> },
  { label: "Low-Carb", value: "low-carb", icon: <Apple className="h-4 w-4" /> },
  { label: "Keto", value: "keto", icon: <Beef className="h-4 w-4" /> },
  { label: "Paleo", value: "paleo", icon: <Beef className="h-4 w-4" /> },
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

// Ingredient category icons
const getCategoryIcon = (ingredient: string) => {
  const lowerIngredient = ingredient.toLowerCase();
  
  if (INGREDIENT_SUGGESTIONS.Proteins.some(item => lowerIngredient.includes(item))) {
    return <Beef className="h-4 w-4 text-red-500" />;
  }
  
  if (INGREDIENT_SUGGESTIONS.Vegetables.some(item => lowerIngredient.includes(item))) {
    return <Carrot className="h-4 w-4 text-orange-500" />;
  }
  
  if (INGREDIENT_SUGGESTIONS.Fruits.some(item => lowerIngredient.includes(item))) {
    return <Apple className="h-4 w-4 text-green-500" />;
  }
  
  if (INGREDIENT_SUGGESTIONS["Dairy & Alternatives"].some(item => lowerIngredient.includes(item))) {
    return <Egg className="h-4 w-4 text-yellow-500" />;
  }
  
  if (INGREDIENT_SUGGESTIONS["Grains & Starches"].some(item => lowerIngredient.includes(item))) {
    return <Wheat className="h-4 w-4 text-amber-500" />;
  }
  
  return <Coffee className="h-4 w-4 text-stone-500" />;
};

// Define props type
type IngredientsPageProps = {
  params?: {
    [key: string]: string | undefined;
  };
};

export function IngredientsPage({ params }: IngredientsPageProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [newIngredient, setNewIngredient] = useState<Ingredient>({ name: '', quantity: '' });
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([]);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load saved ingredients from localStorage
    const savedIngredients = JSON.parse(localStorage.getItem('selectedIngredients') || '[]');
    setIngredients(savedIngredients);
    
    // Load saved dietary preferences from localStorage
    const savedPreferences = JSON.parse(localStorage.getItem('dietaryPreferences') || '[]');
    setDietaryPreferences(savedPreferences);
  }, []);

  const handleAddIngredient = () => {
    if (newIngredient.name && newIngredient.quantity) {
      const updatedIngredients = [...ingredients, newIngredient];
      setIngredients(updatedIngredients);
      localStorage.setItem('selectedIngredients', JSON.stringify(updatedIngredients));
      setNewIngredient({ name: '', quantity: '' });
      
      // Focus back on the name input after adding
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: 'name' | 'quantity') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'name' && newIngredient.name && quantityInputRef.current) {
        quantityInputRef.current.focus();
      } else if (field === 'quantity' && newIngredient.quantity) {
        handleAddIngredient();
      }
    }
  };

  const handleDietaryPreferenceChange = (preference: DietaryPreference) => {
    setDietaryPreferences(current => {
      const updated = current.includes(preference)
        ? current.filter(p => p !== preference)
        : [...current, preference];
      
      // Save to localStorage
      localStorage.setItem('dietaryPreferences', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSave = () => {
    // Make sure we save all data
    localStorage.setItem('selectedIngredients', JSON.stringify(ingredients));
    localStorage.setItem('dietaryPreferences', JSON.stringify(dietaryPreferences));
    localStorage.setItem('availableIngredients', JSON.stringify(ingredients.map(i => i.name)));
    
    toast({
      title: "Preferences saved!",
      description: "Your ingredients and dietary preferences have been saved successfully."
    });
    setLocation('/discover');
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <div className="flex items-center mb-6">
        <Link href="/discover">
          <Button variant="ghost" size="icon" className="hover:bg-orange-50">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold ml-2">My Pantry</h1>
      </div>

      {/* Dietary Preferences Section */}
      <Card className="mb-6 overflow-hidden shadow-sm border-0 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Dietary Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mt-2">
            {DIETARY_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={dietaryPreferences.includes(option.value) ? "default" : "outline"}
                className={cn(
                  "rounded-full border transition-all",
                  dietaryPreferences.includes(option.value) 
                    ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600" 
                    : "bg-white border-orange-100 text-gray-700 hover:bg-orange-50"
                )}
                onClick={() => handleDietaryPreferenceChange(option.value)}
              >
                <span className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ingredients Section */}
      <Card className="mb-6 overflow-hidden shadow-sm border-0 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Add Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ingredient" className="text-sm font-medium">
                  Ingredient
                </Label>
                <div className="relative">
                  <Input
                    id="ingredient"
                    ref={nameInputRef}
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, 'name')}
                    placeholder="e.g., chicken breast"
                    className="pl-9 rounded-full h-11 border-orange-100 focus-visible:ring-orange-200"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <Search className="h-4 w-4" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  ref={quantityInputRef}
                  value={newIngredient.quantity}
                  onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                  onKeyDown={(e) => handleKeyDown(e, 'quantity')}
                  placeholder="e.g., 500g"
                  className="rounded-full h-11 border-orange-100 focus-visible:ring-orange-200"
                />
              </div>
            </div>
            <Button 
              onClick={handleAddIngredient} 
              className="w-full rounded-full bg-orange-500 hover:bg-orange-600 shadow-sm h-11 transition-all hover:shadow"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Ingredient
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Your Ingredients</h2>
        {ingredients.length === 0 ? (
          <Card className="p-6 text-center bg-white shadow-sm border border-dashed border-orange-200">
            <p className="text-muted-foreground">No ingredients added yet. Add some ingredients to get recipe suggestions!</p>
          </Card>
        ) : (
          <div className="flex flex-wrap gap-2 mt-2">
            {ingredients.map((ingredient, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ y: -2 }}
                className={cn(
                  "flex items-center gap-2 bg-white border border-orange-100 px-3 py-2 rounded-full shadow-sm",
                  selectedIngredient?.name === ingredient.name ? "bg-orange-50 border-orange-200 ring-1 ring-orange-200" : ""
                )}
              >
                <div className="flex-shrink-0">
                  {getCategoryIcon(ingredient.name)}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-sm truncate">{ingredient.name}</p>
                  <p className="text-xs text-muted-foreground">{ingredient.quantity}</p>
                </div>
                <button
                  onClick={() => handleRemoveIngredient(index)}
                  className="flex-shrink-0 p-1 hover:bg-orange-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Button 
          onClick={handleSave} 
          className="w-full py-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md hover:shadow-lg transition-all"
        >
          Save and Continue
        </Button>
      </div>
    </div>
  );
}
