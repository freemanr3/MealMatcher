import { useCallback, useMemo, memo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, DollarSign, Heart, Users, Flame, Egg, Wheat, Info, ChefHat } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import DOMPurify from "dompurify";
import type { Recipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: Recipe;
  onLike?: (recipeId: number) => void;
  onViewDetails?: (recipeId: number) => void;
  onClick?: () => void;
  isLiked?: boolean;
  className?: string;
}

// Memoized helper function to strip HTML tags
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

// Memoized function to get first paragraph
const getFirstParagraph = (text: string): string => {
  if (!text) return '';
  try {
    const cleaned = text.replace(/<br\s*\/?>/gi, ' ');
    const paragraph = cleaned.split(/\n|<\/p>|<\/div>/)[0];
    return paragraph.length > 150 ? `${paragraph.substring(0, 150)}...` : paragraph;
  } catch (error) {
    console.error("Error getting paragraph:", error);
    return '';
  }
};

// Memoized image component to prevent unnecessary re-renders
const RecipeImage = memo(({ src, alt, title }: { src: string; alt: string; title: string }) => (
  <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 w-full overflow-hidden bg-gray-100">
    <img
      src={src}
      alt={alt}
      title={title}
      className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const target = e.currentTarget;
        if (target.src !== 'https://placehold.co/600x400?text=No+Image') {
          target.src = 'https://placehold.co/600x400?text=No+Image';
        }
      }}
    />
    {/* Gradient overlay for better text readability */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
  </div>
));

RecipeImage.displayName = 'RecipeImage';

// Memoized dietary badge component
const DietaryBadge = memo(({ type, icon: Icon }: { type: string; icon: any }) => (
  <Badge variant="secondary" className="bg-green-100 text-green-800 shadow-sm text-xs">
    <Icon className="w-3 h-3 mr-1" />
    {type}
  </Badge>
));

DietaryBadge.displayName = 'DietaryBadge';

// Memoized stat item component
const StatItem = memo(({ icon: Icon, label, value, color, tooltip }: {
  icon: any;
  label: string;
  value: string | React.ReactNode;
  color: string;
  tooltip?: string;
}) => (
  <div className="flex flex-col items-center text-center p-2" title={tooltip}>
    <Icon className={`w-4 h-4 md:w-5 md:h-5 mb-1 ${color}`} />
    <span className="text-xs text-muted-foreground font-medium leading-tight">{label}</span>
    <span className="text-sm md:text-base font-bold mt-0.5">{value}</span>
  </div>
));

StatItem.displayName = 'StatItem';

const RecipeCard = memo(({ 
  recipe, 
  onLike, 
  onViewDetails, 
  onClick, 
  isLiked = false,
  className = ""
}: RecipeCardProps) => {
  // Early return for invalid recipe
  if (!recipe || typeof recipe !== 'object') {
    console.error("Invalid recipe object:", recipe);
    return null;
  }

  // Memoize expensive calculations
  const nutritionData = useMemo(() => ({
    calories: Math.round((recipe.estimatedCost || 10) * 100),
    protein: Math.round((recipe.estimatedCost || 5) * 5),
  }), [recipe.estimatedCost]);

  const dietaryInfo = useMemo(() => {
    const tags = recipe.dietaryTags || [];
    return {
      isGlutenFree: tags.includes('gluten-free'),
      isVegan: tags.includes('vegan'),
      isVegetarian: tags.includes('vegetarian'),
    };
  }, [recipe.dietaryTags]);

  const cleanDescription = useMemo(() => {
    if (!recipe.summary) return '';
    return getFirstParagraph(stripHtml(recipe.summary));
  }, [recipe.summary]);

  const timeDisplay = useMemo(() => {
    if (typeof recipe.readyInMinutes === 'number' && recipe.readyInMinutes > 0) {
      return `${recipe.readyInMinutes}m`;
    }
    return '—';
  }, [recipe.readyInMinutes]);

  // Memoize safe recipe data
  const safeRecipe = useMemo(() => ({
    id: recipe.id || 0,
    title: recipe.title || 'Untitled Recipe',
    image: recipe.image || 'https://placehold.co/600x400?text=No+Image',
    cuisines: recipe.cuisines || [],
    dishTypes: recipe.dishTypes || [],
    servings: recipe.servings || 4,
    estimatedCost: recipe.estimatedCost || 10.99,
  }), [recipe.id, recipe.title, recipe.image, recipe.cuisines, recipe.dishTypes, recipe.servings, recipe.estimatedCost]);

  // Memoized event handlers
  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(safeRecipe.id);
  }, [onLike, safeRecipe.id]);

  const handleViewDetails = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.(safeRecipe.id);
  }, [onViewDetails, safeRecipe.id]);

  const handleCardClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <Card 
      className={`w-full overflow-hidden flex flex-col rounded-xl h-full cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 bg-white ${className}`}
      onClick={handleCardClick}
    >
      {/* Image section */}
      <div className="relative">
        <RecipeImage 
          src={safeRecipe.image}
          alt={safeRecipe.title}
          title={safeRecipe.title}
        />
        
        {/* Dietary markers overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[60%]">
          {dietaryInfo.isVegan && (
            <DietaryBadge type="Vegan" icon={Wheat} />
          )}
          {dietaryInfo.isVegetarian && !dietaryInfo.isVegan && (
            <DietaryBadge type="Vegetarian" icon={Wheat} />
          )}
          {dietaryInfo.isGlutenFree && (
            <DietaryBadge type="GF" icon={Wheat} />
          )}
        </div>

        {/* Like button overlay */}
        {onLike && (
          <button
            className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110 touch-manipulation"
            onClick={handleLike}
            aria-label={isLiked ? "Unlike recipe" : "Like recipe"}
          >
            <Heart 
              className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
        )}
      </div>
      
      {/* Content section */}
      <div className="flex flex-col flex-grow p-4 md:p-6 gap-4">
        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold leading-tight line-clamp-2 text-gray-900">
          {safeRecipe.title}
        </h2>
        
        {/* Cuisine & Type Tags */}
        <div className="flex flex-wrap gap-1.5">
          {safeRecipe.cuisines.slice(0, 2).map((cuisine) => (
            <Badge key={cuisine} variant="outline" className="text-xs md:text-sm py-1 px-2 bg-orange-50 text-orange-700 border-orange-200">
              {cuisine}
            </Badge>
          ))}
          {safeRecipe.dishTypes?.slice(0, 2).map((type) => (
            <Badge key={type} variant="outline" className="text-xs md:text-sm py-1 px-2 bg-blue-50 text-blue-700 border-blue-200">
              {type}
            </Badge>
          ))}
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-1 py-3 border-y border-gray-100">
          <StatItem
            icon={Clock}
            label="Time"
            value={timeDisplay}
            color="text-orange-500"
            tooltip="Total cooking time"
          />
          <StatItem
            icon={Users}
            label="Serves"
            value={safeRecipe.servings}
            color="text-blue-500"
            tooltip="Number of servings"
          />
          <StatItem
            icon={DollarSign}
            label="Cost"
            value={`$${safeRecipe.estimatedCost.toFixed(0)}`}
            color="text-green-500"
            tooltip="Estimated cost per recipe"
          />
        </div>
        
        {/* Nutrition info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center" title="Estimated calories">
            <Flame className="w-4 h-4 mr-2 text-red-500" />
            <span className="text-sm font-medium text-gray-700">{nutritionData.calories} cal</span>
          </div>
          <div className="flex items-center" title="Estimated protein">
            <Egg className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">{nutritionData.protein}g protein</span>
          </div>
        </div>
        
        {/* Description */}
        {cleanDescription && (
          <p className="text-sm text-muted-foreground line-clamp-3 flex-grow leading-relaxed">
            {cleanDescription}
          </p>
        )}
        
        {/* Action button */}
        {onViewDetails && (
          <Button 
            variant="default" 
            className="w-full mt-auto bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 touch-manipulation"
            onClick={handleViewDetails}
          >
            <ChefHat className="w-4 h-4 mr-2" />
            View Recipe
          </Button>
        )}
      </div>
    </Card>
  );
});

RecipeCard.displayName = 'RecipeCard';

export { RecipeCard }; 