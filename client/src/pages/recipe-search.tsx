import { useState } from 'react';
import { IngredientInput } from '@/components/ingredient-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { recipeService, type Recipe } from '@/services/recipeService';
import { Loader2 } from 'lucide-react';

export default function RecipeSearch() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (ingredients: string[]) => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await recipeService.searchByIngredients(ingredients, {
        number: 10,
        ranking: 1,
        ignorePantry: true,
      });
      setRecipes(results);
    } catch (err) {
      setError('Failed to fetch recipes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Find Recipes by Ingredients
      </h1>

      <div className="max-w-2xl mx-auto mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <IngredientInput onIngredientsChange={handleSearch} />
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id}>
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{recipe.title}</h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Used Ingredients:</span>{' '}
                    {recipe.usedIngredientCount}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Missing Ingredients:</span>{' '}
                    {recipe.missedIngredientCount}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {recipe.usedIngredients.map((ingredient) => (
                      <span
                        key={ingredient.id}
                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                      >
                        {ingredient.name}
                      </span>
                    ))}
                    {recipe.missedIngredients.map((ingredient) => (
                      <span
                        key={ingredient.id}
                        className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                      >
                        {ingredient.name}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 