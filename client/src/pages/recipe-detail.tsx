import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, DollarSign, Users, ChevronLeft, Heart, Bookmark, Share2, Printer } from "lucide-react";
import { recipeService } from "@/services/recipeService";
import { Header } from "@/components/header";
import { InteractiveSteps } from "@/components/recipe/InteractiveSteps";
import { sanitizeHtml } from "@/lib/recipeUtils";

// Define the params type
type RecipeParams = {
  id: string;
};

const RecipeDetail = () => {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<RecipeParams>("/recipes/:id");
  const [isSaved, setIsSaved] = useState(false);
  
  // Get recipe ID from URL params
  const recipeId = match && params ? parseInt(params.id) : null;
  
  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => recipeService.getRecipeDetails(recipeId as number),
    enabled: recipeId !== null,
  });
  
  useEffect(() => {
    // Check if recipe is saved in localStorage
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    if (recipeId && savedRecipes.some((saved: any) => saved.id === recipeId)) {
      setIsSaved(true);
    }
  }, [recipeId]);
  
  const handleSaveRecipe = () => {
    if (!recipe) return;
    
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    
    // Toggle saved state
    if (isSaved) {
      const filteredRecipes = savedRecipes.filter((saved: any) => saved.id !== recipe.id);
      localStorage.setItem('savedRecipes', JSON.stringify(filteredRecipes));
    } else {
      savedRecipes.push(recipe);
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    }
    
    setIsSaved(!isSaved);
  };
  
  const handleGoBack = () => {
    setLocation("/discover");
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <Header />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Skeleton className="h-10 w-20" />
          </div>
          
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          
          <Skeleton className="aspect-video w-full rounded-lg mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="h-8 w-40 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-8" />
              
              <Skeleton className="h-8 w-40 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-8 w-40 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <Header />
        <div className="container max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
          <p className="mb-6">Sorry, we couldn't find the recipe you're looking for.</p>
          <Button onClick={handleGoBack}>Go Back</Button>
        </div>
      </div>
    );
  }
  
  // Add analyzedInstructions to recipe type if it doesn't exist
  const analyzedInstructions = (recipe as any).analyzedInstructions || [];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Header />
      <article className="container max-w-4xl mx-auto px-4 py-8">
        {/* Back button and actions */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={handleGoBack} className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleSaveRecipe}
              className={isSaved ? "text-red-500" : ""}
            >
              {isSaved ? <Bookmark className="h-4 w-4 fill-current" /> : <Bookmark className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Recipe title and description */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{recipe.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.cuisines?.length > 0 && recipe.cuisines.map((cuisine) => (
              <Badge key={cuisine} variant="outline">
                {cuisine}
              </Badge>
            ))}
            {recipe.dishTypes?.length > 0 && recipe.dishTypes.map((type) => (
              <Badge key={type} variant="outline">
                {type}
              </Badge>
            ))}
          </div>
        </header>
        
        {/* Recipe image and key info */}
        <div className="mb-8">
          <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="object-cover w-full h-full"
            />
            
            {/* Diet tags overlay */}
            {recipe.dietaryTags?.length > 0 && (
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {recipe.dietaryTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-white/80 backdrop-blur-sm text-gray-800">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex justify-center mb-2">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-sm text-muted-foreground">Prep Time</p>
              <p className="font-semibold">{recipe.cookingTime} min</p>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex justify-center mb-2">
                <Users className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-sm text-muted-foreground">Servings</p>
              <p className="font-semibold">{recipe.servings}</p>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex justify-center mb-2">
                <DollarSign className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-sm text-muted-foreground">Est. Cost</p>
              <p className="font-semibold">${recipe.estimatedCost.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        {/* Recipe content tabs */}
        <Tabs defaultValue="instructions" className="mb-8">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="instructions" className="p-4 bg-white rounded-lg shadow-sm">
            <InteractiveSteps
              instructions={recipe.instructions}
              analyzedInstructions={analyzedInstructions}
            />
          </TabsContent>
          
          <TabsContent value="ingredients" className="p-4 bg-white rounded-lg shadow-sm">
            <ul className="space-y-2">
              {recipe.extendedIngredients?.map((ingredient, index) => {
                // Extract notes from ingredient if available
                const notes = (ingredient as any).notes;
                
                return (
                  <li key={index} className="flex items-start gap-2">
                    <span className="inline-block w-6 h-6 bg-orange-100 text-orange-600 rounded-full text-center leading-6 font-semibold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span>
                      {ingredient.amount} {ingredient.unit} {ingredient.name}
                      {notes && <span className="text-sm text-muted-foreground ml-2">({notes})</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </TabsContent>
          
          <TabsContent value="summary" className="p-4 bg-white rounded-lg shadow-sm">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(recipe.summary) }}
            />
          </TabsContent>
        </Tabs>
        
        {/* Nutrition and additional info */}
        {/* This would be expanded with actual nutrition data from the API */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Nutrition Facts</h2>
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Calories</span>
                <span>{Math.round(recipe.estimatedCost * 100)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Protein</span>
                <span>{Math.round(recipe.estimatedCost * 5)}g</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Carbohydrates</span>
                <span>{Math.round(recipe.estimatedCost * 10)}g</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Fat</span>
                <span>{Math.round(recipe.estimatedCost * 4)}g</span>
              </div>
            </div>
          </Card>
        </div>
      </article>
    </div>
  );
};

export default RecipeDetail; 