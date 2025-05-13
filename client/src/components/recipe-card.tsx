import { useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, DollarSign, Heart, Users, Flame, Egg, Wheat } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import DOMPurify from "dompurify";
import type { Recipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: Recipe;
  onLike?: (recipeId: number) => void;
  onViewDetails?: (recipeId: number) => void;
  onClick?: () => void;
}

// Helper function to strip HTML tags completely
const stripHtml = (html: string): string => {
  if (!html) return '';
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  } catch (error) {
    console.error("Error stripping HTML:", error);
    return '';
  }
};

// Helper function to extract first paragraph of text
const getFirstParagraph = (text: string): string => {
  if (!text) return '';
  try {
    const cleaned = text.replace(/<br\s*\/?>/gi, ' '); // Replace <br> tags with spaces
    const paragraph = cleaned.split(/\n|<\/p>|<\/div>/)[0]; // Get first paragraph
    return paragraph.length > 200 ? `${paragraph.substring(0, 200)}...` : paragraph;
  } catch (error) {
    console.error("Error getting paragraph:", error);
    return '';
  }
};

export function RecipeCard({ recipe, onLike, onViewDetails, onClick }: RecipeCardProps) {
  // Ensure recipe has required properties
  if (!recipe || typeof recipe !== 'object') {
    console.error("Invalid recipe object:", recipe);
    return null;
  }

  // Sanitize HTML content
  const sanitizeHtml = useCallback((htmlContent: string): string => {
    if (!htmlContent) return '';
    try {
      return DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
        ALLOWED_ATTR: []
      });
    } catch (error) {
      console.error("Error sanitizing HTML:", error);
      return '';
    }
  }, []);

  // Get cleaned description (either sanitized or stripped)
  const getCleanDescription = (): string => {
    if (!recipe.summary) return '';
    return stripHtml(recipe.summary);
  };

  // Calculate nutritional values (placeholder - would come from API)
  const calories = Math.round((recipe.estimatedCost || 10) * 100);
  const protein = Math.round((recipe.estimatedCost || 5) * 5);
  
  // Safely determine dietary tags
  const dietaryTags = recipe.dietaryTags || [];
  
  // Determine if recipe has specific dietaryTags
  const isGlutenFree = dietaryTags.includes('gluten-free');
  const isVegan = dietaryTags.includes('vegan');
  const isVegetarian = dietaryTags.includes('vegetarian');

  // Ensure recipe has required properties with fallbacks
  const safeRecipe = {
    id: recipe.id || 0,
    title: recipe.title || 'Untitled Recipe',
    image: recipe.image || 'https://placehold.co/600x400?text=No+Image',
    cuisines: recipe.cuisines || [],
    dishTypes: recipe.dishTypes || [],
    cookingTime: recipe.cookingTime || recipe.readyInMinutes || 30,
    servings: recipe.servings || 4,
    estimatedCost: recipe.estimatedCost || 10.99,
    likes: recipe.likes || 0
  };

  return (
    <Card 
      className="w-full overflow-hidden flex flex-col rounded-xl h-full cursor-pointer"
      onClick={onClick}
    >
      {/* Image section - spans full width, half height */}
      <div className="relative h-60 sm:h-72 md:h-80 w-full overflow-hidden">
        <img
          src={safeRecipe.image}
          alt={safeRecipe.title}
          className="object-cover w-full h-full transition-transform hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image';
          }}
        />
        
        {/* Key dietary markers overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isVegan && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 shadow-sm">
              <Wheat className="w-3.5 h-3.5 mr-1.5" />Vegan
            </Badge>
          )}
          {isVegetarian && !isVegan && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 shadow-sm">
              <Wheat className="w-3.5 h-3.5 mr-1.5" />Vegetarian
            </Badge>
          )}
          {isGlutenFree && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 shadow-sm">
              <Wheat className="w-3.5 h-3.5 mr-1.5" />Gluten-Free
            </Badge>
          )}
        </div>
      </div>
      
      {/* Content section */}
      <div className="flex flex-col flex-grow p-4 md:p-5 gap-3">
        {/* Title */}
        <h2 className="text-2xl md:text-2.5xl font-bold leading-tight">{safeRecipe.title}</h2>
        
        {/* Cuisine & Type Tags */}
        <div className="flex flex-wrap gap-1.5">
          {safeRecipe.cuisines.length > 0 && safeRecipe.cuisines.slice(0, 2).map((cuisine) => (
            <Badge key={cuisine} variant="outline" className="text-sm md:text-base py-1 px-2.5">
              {cuisine}
            </Badge>
          ))}
          {safeRecipe.dishTypes?.length > 0 && safeRecipe.dishTypes.slice(0, 2).map((type) => (
            <Badge key={type} variant="outline" className="text-sm md:text-base py-1 px-2.5">
              {type}
            </Badge>
          ))}
        </div>
        
        {/* Stats Row - evenly spaced */}
        <div className="grid grid-cols-3 gap-2 my-1 py-2 border-y border-gray-100">
          <div className="flex flex-col items-center" title="Preparation Time">
            <Clock className="w-5 h-5 md:w-6 md:h-6 mb-1 text-orange-500" />
            <span className="text-sm md:text-base font-medium">{safeRecipe.cookingTime} min</span>
          </div>
          <div className="flex flex-col items-center" title="Servings">
            <Users className="w-5 h-5 md:w-6 md:h-6 mb-1 text-blue-500" />
            <span className="text-sm md:text-base font-medium">{safeRecipe.servings}</span>
          </div>
          <div className="flex flex-col items-center" title="Estimated Cost">
            <DollarSign className="w-5 h-5 md:w-6 md:h-6 mb-1 text-green-500" />
            <span className="text-sm md:text-base font-medium">${safeRecipe.estimatedCost.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Nutrition info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center" title="Calories">
            <Flame className="w-5 h-5 md:w-6 md:h-6 mr-2 text-red-500" />
            <span className="text-sm md:text-base font-medium">{calories} cal</span>
          </div>
          <div className="flex items-center" title="Protein">
            <Egg className="w-5 h-5 md:w-6 md:h-6 mr-2 text-yellow-500" />
            <span className="text-sm md:text-base font-medium">{protein}g protein</span>
          </div>
        </div>
        
        {/* Description - limited to 2 lines */}
        <p className="text-sm md:text-base text-muted-foreground line-clamp-2 flex-grow">
          {getCleanDescription()}
        </p>
        
        {/* Diet tags */}
        {dietaryTags.filter(tag => tag !== 'gluten-free' && tag !== 'vegan' && tag !== 'vegetarian').length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {dietaryTags
              .filter(tag => tag !== 'gluten-free' && tag !== 'vegan' && tag !== 'vegetarian')
              .slice(0, 3)
              .map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))}
            {dietaryTags.filter(tag => tag !== 'gluten-free' && tag !== 'vegan' && tag !== 'vegetarian').length > 3 && (
              <Badge variant="outline" className="text-sm">
                +{dietaryTags.filter(tag => tag !== 'gluten-free' && tag !== 'vegan' && tag !== 'vegetarian').length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {/* CTA Row */}
      <CardFooter className="flex justify-between p-4 md:p-5 pt-0 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (onLike && safeRecipe.id) {
              onLike(safeRecipe.id);
            }
          }}
          className="flex items-center gap-1.5"
        >
          <Heart className="w-5 h-5" />
          <span className="font-medium">{safeRecipe.likes}</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetails && safeRecipe.id) {
              onViewDetails(safeRecipe.id);
            }
          }}
          className="px-4 py-2 font-medium"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
} 