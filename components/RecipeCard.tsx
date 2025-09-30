import React from 'react';
import { Recipe } from '../types';
import { ChefHatIcon } from './icons/ChefHatIcon';

interface RecipeCardProps {
  recipe: Recipe;
  userIngredients: string[];
}

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, userIngredients }) => {
    const userIngredientsLower = userIngredients.map(i => i.toLowerCase());

    const isUserIngredient = (ingredient: string) => {
        return userIngredientsLower.some(userIng => ingredient.toLowerCase().includes(userIng));
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-200 flex flex-col">
            <div className="h-48 w-full">
                {recipe.imageUrl ? (
                    <img className="h-48 w-full object-cover" src={recipe.imageUrl} alt={recipe.title} />
                ) : (
                    <div className="h-48 w-full bg-gray-200 animate-pulse flex items-center justify-center">
                        <ChefHatIcon className="w-12 h-12 text-gray-400" />
                    </div>
                )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">{recipe.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{recipe.description}</p>
                
                <div className="flex items-center text-sm text-gray-600 mb-6 space-x-4">
                    <div className="flex items-center">
                        <ClockIcon />
                        <span>Preparo: {recipe.prepTime}</span>
                    </div>
                    <div className="flex items-center">
                        <ClockIcon />
                        <span>Cozimento: {recipe.cookTime}</span>
                    </div>
                </div>

                <div className="space-y-4 flex-grow">
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Ingredientes</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            {recipe.ingredients.map((ingredient, index) => (
                                <li key={index} className={`${isUserIngredient(ingredient) ? 'text-emerald-700 font-medium' : 'text-gray-700'}`}>
                                    {ingredient}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Instruções</h4>
                        <ol className="list-decimal list-inside text-sm space-y-2 text-gray-700">
                            {recipe.instructions.map((step, index) => (
                                <li key={index}>{step}</li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};