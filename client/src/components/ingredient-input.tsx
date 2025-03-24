import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ingredientsList } from "@shared/mock-data";

interface IngredientInputProps {
  onIngredientsChange: (ingredients: string[]) => void;
}

export function IngredientInput({ onIngredientsChange }: IngredientInputProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      const newIngredients = [...ingredients, currentIngredient.trim()];
      setIngredients(newIngredients);
      onIngredientsChange(newIngredients);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    const newIngredients = ingredients.filter(i => i !== ingredient);
    setIngredients(newIngredients);
    onIngredientsChange(newIngredients);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter an ingredient"
          value={currentIngredient}
          onChange={(e) => setCurrentIngredient(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={addIngredient} type="button">
          Add
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ingredient) => (
          <div
            key={ingredient}
            className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full"
          >
            <span>{ingredient}</span>
            <button
              onClick={() => removeIngredient(ingredient)}
              className="hover:text-orange-950"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}