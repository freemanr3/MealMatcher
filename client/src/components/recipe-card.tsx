import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Clock, Users, ChefHat, ChevronRight, ChevronLeft } from 'lucide-react';
import { Recipe, AnalyzedInstruction } from '@/services/recipeService';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { recipeService } from '@/services/recipeService';

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: (recipe: Recipe) => void;
  className?: string;
}

export function RecipeCard({ recipe, onSave, className }: RecipeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const { data: instructions } = useQuery({
    queryKey: ['recipe-instructions', recipe.id],
    queryFn: () => recipeService.getAnalyzedInstructions(recipe.id),
    enabled: isFlipped,
  });

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={cn('relative w-full h-full', className)}>
      <div
        className={cn(
          'relative w-full h-full transition-transform duration-500 transform-gpu',
          isFlipped ? 'rotate-y-180' : ''
        )}
      >
        {/* Front of card */}
        <Card className="w-full h-full">
          <CardHeader className="p-0">
            <div className="relative aspect-[4/3]">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover rounded-t-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => onSave?.(recipe)}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2">{recipe.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>30m</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>4</span>
              </div>
              <div className="flex items-center gap-1">
                <ChefHat className="h-4 w-4" />
                <span>Easy</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleFlip}
            >
              View Instructions
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Back of card */}
        <div className="absolute inset-0 w-full h-full rotate-y-180">
          <Card className="w-full h-full">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{recipe.title}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFlip}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto max-h-[calc(100vh-300px)]">
              {instructions?.map((instruction, index) => (
                <div key={index} className="mb-6">
                  {instruction.name && (
                    <h4 className="font-medium mb-2">{instruction.name}</h4>
                  )}
                  <ol className="list-decimal list-inside space-y-4">
                    {instruction.steps.map((step) => (
                      <li key={step.number} className="text-sm">
                        <p className="mb-2">{step.step}</p>
                        {step.ingredients.length > 0 && (
                          <div className="ml-4 text-xs text-muted-foreground">
                            <p className="font-medium">Ingredients:</p>
                            <ul className="list-disc list-inside">
                              {step.ingredients.map((ingredient) => (
                                <li key={ingredient.id}>{ingredient.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {step.equipment.length > 0 && (
                          <div className="ml-4 text-xs text-muted-foreground">
                            <p className="font-medium">Equipment:</p>
                            <ul className="list-disc list-inside">
                              {step.equipment.map((item) => (
                                <li key={item.id}>{item.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 