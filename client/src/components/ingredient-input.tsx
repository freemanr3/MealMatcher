import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ingredientsList } from "@shared/mock-data";

interface IngredientInputProps {
  value: string[];
  onChange: (ingredients: string[]) => void;
}

export function IngredientInput({ value, onChange }: IngredientInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddIngredient = () => {
    if (inputValue && !value.includes(inputValue)) {
      onChange([...value, inputValue]);
      setInputValue("");
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    onChange(value.filter((i) => i !== ingredient));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          list="ingredients"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add ingredient..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddIngredient();
            }
          }}
        />
        <datalist id="ingredients">
          {ingredientsList.map((ingredient) => (
            <option key={ingredient} value={ingredient} />
          ))}
        </datalist>
        <Button onClick={handleAddIngredient}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map((ingredient) => (
          <Badge
            key={ingredient}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {ingredient}
            <X
              className="w-3 h-3 cursor-pointer"
              onClick={() => handleRemoveIngredient(ingredient)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
}