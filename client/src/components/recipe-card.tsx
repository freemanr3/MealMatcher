import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Heart } from "lucide-react";
import type { Recipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: Recipe;
  onLike?: (recipeId: number) => void;
  onViewDetails?: (recipeId: number) => void;
}

export function RecipeCard({ recipe, onLike, onViewDetails }: RecipeCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="object-cover w-full h-full"
          />
        </div>
        <CardTitle className="mt-4">{recipe.title}</CardTitle>
        <CardDescription>{recipe.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.dietaryTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.cookingTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>${recipe.estimatedCost.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onLike?.(recipe.id)}
          className="flex items-center gap-1"
        >
          <Heart className="w-4 h-4" />
          <span>{recipe.likes}</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onViewDetails?.(recipe.id)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
} 