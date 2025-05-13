import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Utensils, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { recipeService } from '@/services/recipeService';
import { RecipeDetail } from '@/types/recipe';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';

// Define props type
type HomePageProps = {
  params?: {
    [key: string]: string | undefined;
  };
};

export default function HomePage({ params }: HomePageProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setLocation] = useLocation();

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['randomRecipes'],
    queryFn: () => recipeService.getRandomRecipes(5),
    enabled: !!user
  });

  const nextRecipe = () => {
    if (recipes) {
      setCurrentIndex((prev) => (prev + 1) % recipes.length);
    }
  };

  const previousRecipe = () => {
    if (recipes) {
      setCurrentIndex((prev) => (prev - 1 + recipes.length) % recipes.length);
    }
  };

  const currentRecipe = recipes?.[currentIndex];

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Pantry Pal</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your personal recipe discovery and meal planning assistant
        </p>
      </div>

      {isLoading ? (
        <div className="text-center">Loading recipes...</div>
      ) : currentRecipe ? (
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">{currentRecipe.title}</CardTitle>
              <CardDescription>
                Ready in {currentRecipe.readyInMinutes} minutes • {currentRecipe.servings} servings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative mb-4">
                <img
                  src={currentRecipe.image}
                  alt={currentRecipe.title}
                  className="rounded-lg object-cover w-full h-full"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={previousRecipe}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={nextRecipe}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex justify-center gap-4">
                <Link href="/discover">
                  <Button>Discover More</Button>
                </Link>
                <Link href="/ingredients">
                  <Button variant="outline">Add Ingredients</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <ChefHat className="h-8 w-8 mb-2 text-orange-500" />
            <CardTitle>Discover Recipes</CardTitle>
            <CardDescription>
              Find delicious recipes based on your available ingredients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/discover">
              <Button className="w-full">Start Discovering</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Utensils className="h-8 w-8 mb-2 text-orange-500" />
            <CardTitle>My Ingredients</CardTitle>
            <CardDescription>
              Manage your pantry and available ingredients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/ingredients">
              <Button className="w-full">Manage Ingredients</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Calendar className="h-8 w-8 mb-2 text-orange-500" />
            <CardTitle>Meal Planner</CardTitle>
            <CardDescription>
              Plan your meals and track your budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/meal-planner">
              <Button className="w-full">View Meal Plan</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
