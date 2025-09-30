import React, { useState } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';

interface IngredientInputProps {
  ingredients: string[];
  setIngredients: (ingredients: string[]) => void;
}

export const IngredientInput: React.FC<IngredientInputProps> = ({ ingredients, setIngredients }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const newIngredient = inputValue.trim().toLowerCase();
      if (newIngredient && !ingredients.includes(newIngredient)) {
        setIngredients([...ingredients, newIngredient]);
      }
      setInputValue('');
    }
  };

  const removeIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter(ingredient => ingredient !== ingredientToRemove));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-sm font-medium px-3 py-1 rounded-full">
            <span>{ingredient}</span>
            <button onClick={() => removeIngredient(ingredient)} className="text-emerald-600 hover:text-emerald-800">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={ingredients.length === 0 ? "ex: frango, arroz, brócolis" : "Adicionar outro..."}
          className="flex-grow bg-transparent p-1 outline-none text-gray-700 placeholder-gray-400"
        />
      </div>
       <p className="text-xs text-gray-500 mt-2">Digite um ingrediente e pressione Enter ou vírgula para adicioná-lo.</p>
    </div>
  );
};