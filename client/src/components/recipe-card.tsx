import { useState } from 'react';
import { motion } from 'framer-motion';
import { Timer, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { RecipeInstructions } from '@/components/recipe-instructions';
import type { RecipeDetail } from '@/services/recipeService';
import { Button } from '@/components/ui/button';

interface RecipeCardProps {
  recipe: RecipeDetail;
  onFlip?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function RecipeCard({ recipe, onFlip, onSave, isSaved }: RecipeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  if (!recipe) {
    return null;
  }

  return (
    <div className="relative perspective-1000" onClick={handleClick}>
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 500, damping: 30 }}
        className="w-full preserve-3d cursor-pointer"
      >
        {/* Front of card */}
        <div className={`absolute w-full backface-hidden ${isFlipped ? 'invisible' : ''}`}>
          <Card className="overflow-hidden">
            <div className="relative">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-64 object-cover"
              />
              <RecipeInstructions
                title={recipe.title}
                instructions={recipe.instructions || ''}
                summary={recipe.summary || ''}
              />
            </div>
            <div className="p-4 space-y-4">
              <h2 className="text-xl font-semibold">{recipe.title}</h2>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span>{recipe.readyInMinutes || '?'} mins</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{recipe.servings || '?'} servings</span>
                </div>
              </div>

              {recipe.usedIngredients && recipe.usedIngredients.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Ingredients You Have ({recipe.usedIngredientCount})</h3>
                  <div className="flex flex-wrap gap-1">
                    {recipe.usedIngredients.map(ingredient => (
                      <span
                        key={ingredient.id}
                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"
                      >
                        {ingredient.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {recipe.missedIngredients && recipe.missedIngredients.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Additional Ingredients Needed ({recipe.missedIngredientCount})</h3>
                  <div className="flex flex-wrap gap-1">
                    {recipe.missedIngredients.map(ingredient => (
                      <span
                        key={ingredient.id}
                        className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                      >
                        {ingredient.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {onSave && (
                <Button
                  variant={isSaved ? "secondary" : "default"}
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave();
                  }}
                >
                  {isSaved ? 'Saved to Meal Plan' : 'Add to Meal Plan'}
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Back of card */}
        <div 
          className={`absolute w-full h-full backface-hidden ${!isFlipped ? 'invisible' : ''}`}
          style={{ transform: 'rotateY(180deg)' }}
        >
          <Card className="h-full overflow-hidden">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Instructions</h2>
              <div className="prose prose-sm">
                {recipe.summary && (
                  <div dangerouslySetInnerHTML={{ __html: recipe.summary }} />
                )}
                {recipe.instructions && (
                  <>
                    <h3 className="mt-4 font-medium">Steps:</h3>
                    <div className="space-y-2">
                      {recipe.instructions.split('\n').map((step, index) => (
                        <p key={index} className="text-sm">{step}</p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
} 