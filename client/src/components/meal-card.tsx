import { motion, PanInfo } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign } from "lucide-react";
import type { Recipe } from "@/lib/types";

interface MealCardProps {
  recipe: Recipe;
  onSwipe: (direction: "left" | "right") => void;
}

export function MealCard({ recipe, onSwipe }: MealCardProps) {
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleDragEnd = (_e: never, info: PanInfo) => {
    const swipeThreshold = 100;
    const dragDistance = info.offset.x;

    if (Math.abs(dragDistance) > swipeThreshold) {
      onSwipe(dragDistance > 0 ? "right" : "left");
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={(e, info) => setDragStart({ x: info.point.x, y: info.point.y })}
      onDragEnd={handleDragEnd}
      className="w-full max-w-sm mx-auto cursor-grab active:cursor-grabbing"
    >
      <Card className="overflow-hidden">
        <div className="relative h-64">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardHeader className="p-4">
          <h3 className="text-xl font-bold">{recipe.title}</h3>
          <div className="flex gap-2 items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{recipe.cookingTime} mins</span>
            <DollarSign className="w-4 h-4 ml-2" />
            <span>${recipe.estimatedCost.toFixed(2)}</span>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground mb-4">{recipe.description}</p>
          <div className="flex flex-wrap gap-2">
            {(recipe.dietaryTags as string[]).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}