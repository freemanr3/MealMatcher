import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, History, Calendar, DollarSign, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from '@/components/ui/scroll-area';
import { recipeService, type RecipeDetail } from '@/services/recipeService';
import { useMealPlan } from '@/hooks/use-meal-plan';
import { BudgetTracker } from '@/components/budget-tracker';
import { RecipeCard } from '@/components/recipe-card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

// Define props type
type MealPlannerProps = {
  params?: {
    [key: string]: string | undefined;
  };
};

export default function MealPlanner({ params }: MealPlannerProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('saved');
  const { toast } = useToast();
  const { 
    mealPlan, 
    skippedRecipes, 
    removeFromMealPlan, 
    clearMealPlan,
    recoverSkippedRecipe,
    clearSkippedRecipes,
    budget,
    setBudget,
    spent
  } = useMealPlan();
  
  const handleRemoveRecipe = (recipe: RecipeDetail) => {
    removeFromMealPlan(recipe);
    toast({
      title: "Recipe Removed",
      description: `${recipe.title} has been removed from your meal plan.`
    });
  };
  
  const handleRecoverSkipped = (recipe: RecipeDetail) => {
    recoverSkippedRecipe(recipe);
    toast({
      title: "Recipe Recovered",
      description: `${recipe.title} has been moved to your meal plan.`
    });
  };
  
  const handleAddMoreRecipes = () => {
    setLocation('/discover');
  };
  
  const handleSetBudget = () => {
    const newBudget = window.prompt("Enter your meal plan budget:", budget.toString());
    if (newBudget && !isNaN(Number(newBudget)) && Number(newBudget) > 0) {
      setBudget(Number(newBudget));
      toast({
        title: "Budget Updated",
        description: `Your meal plan budget has been set to $${Number(newBudget).toFixed(2)}.`
      });
    }
  };
  
  const isEmpty = mealPlan.length === 0;
  const hasSkipped = skippedRecipes.length > 0;

  return (
    <div className="container mx-auto max-w-5xl p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Your Meal Plan</h1>
              <p className="text-muted-foreground">Keep track of your saved and skipped recipes</p>
            </div>
            
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5"
                onClick={handleSetBudget}
              >
                <DollarSign className="h-3.5 w-3.5" />
                Set Budget
              </Button>
              
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleAddMoreRecipes}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Recipes
          </Button>
            </div>
      </div>

          <BudgetTracker variant="detailed" className="mb-6" />

          <Tabs defaultValue="saved" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full md:w-auto mb-4 grid grid-cols-2">
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Saved Recipes</span>
                <Badge variant="secondary" className="ml-1">{mealPlan.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="skipped" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>Skipped Recipes</span>
                <Badge variant="secondary" className="ml-1">{skippedRecipes.length}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="saved" className="mt-0 space-y-6">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center p-8 bg-muted/50 rounded-lg border-2 border-dashed">
                  <Cookie className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Saved Recipes</h3>
                  <p className="text-muted-foreground text-center max-w-md mt-2">
                    You haven't saved any recipes to your meal plan yet. Head to the discover page to find some delicious options!
                  </p>
                  <Button onClick={handleAddMoreRecipes} className="mt-6">
                    Add Recipes
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-medium">Saved Recipes</h2>
              <p className="text-sm text-muted-foreground">
                        Total recipe cost: ${spent.toFixed(2)}
                      </p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearMealPlan}
                      className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isEmpty}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                      {mealPlan.map((recipe) => (
                        <motion.div
                          key={recipe.id}
                          layout
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          transition={{ type: "spring", damping: 15, stiffness: 200 }}
                        >
                          <div className="relative group">
                            <RecipeCard 
                              recipe={recipe} 
                              onClick={() => setLocation(`/recipes/${recipe.id}`)}
                            />
                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute top-3 right-3 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveRecipe(recipe);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="skipped" className="mt-0 space-y-6">
              {!hasSkipped ? (
                <div className="flex flex-col items-center justify-center p-8 bg-muted/50 rounded-lg border-2 border-dashed">
                  <History className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Skipped Recipes</h3>
                  <p className="text-muted-foreground text-center max-w-md mt-2">
                    You haven't skipped any recipes yet. When you swipe left on a recipe, it will appear here so you can revisit it later.
                  </p>
                  <Button onClick={handleAddMoreRecipes} className="mt-6">
                    Add Recipes
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-medium">Skipped Recipes</h2>
              <p className="text-sm text-muted-foreground">
                        These recipes will reappear in your swiper queue
                      </p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearSkippedRecipes}
                      className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                      {skippedRecipes.map((recipe) => (
                        <motion.div
                          key={recipe.id}
                          layout
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          transition={{ type: "spring", damping: 15, stiffness: 200 }}
                        >
                          <div className="relative group">
                            <RecipeCard 
                              recipe={recipe} 
                              onClick={() => setLocation(`/recipes/${recipe.id}`)}
                            />
                            <Button
                              size="sm"
                              variant="default"
                              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRecoverSkipped(recipe);
                              }}
                            >
                              Add to Plan
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
