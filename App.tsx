import React, { useState, useCallback } from 'react';
import { IngredientInput } from './components/IngredientInput';
import { RecipeCard } from './components/RecipeCard';
import { Spinner } from './components/Spinner';
import { ChefHatIcon } from './components/icons/ChefHatIcon';
import { generateRecipes, generateRecipeImage } from './services/geminiService';
import { Recipe } from './types';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>(['peito de frango', 'arroz', 'brócolis']);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRecipes = useCallback(async () => {
    if (ingredients.length === 0) {
      setError('Por favor, adicione pelo menos um ingrediente.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const generatedRecipes = await generateRecipes(ingredients);
      setRecipes(generatedRecipes);
      setIsLoading(false); // Stop main loading indicator

      // Asynchronously generate images
      generatedRecipes.forEach(async (recipe, index) => {
        try {
          const imageUrl = await generateRecipeImage(recipe.title);
          setRecipes(prevRecipes => {
            const updatedRecipes = [...prevRecipes];
            if (updatedRecipes[index]) {
              updatedRecipes[index] = { ...updatedRecipes[index], imageUrl };
            }
            return updatedRecipes;
          });
        } catch (imageError) {
          console.error(`Failed to generate image for "${recipe.title}":`, imageError);
          // Don't show an error to the user, just log it. The card will display a placeholder.
        }
      });

    } catch (err) {
      console.error(err);
      setError('Desculpe, não conseguimos gerar receitas no momento. Por favor, tente novamente mais tarde.');
      setIsLoading(false); // Also stop loading on error
    }
  }, [ingredients]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <div className="flex justify-center items-center gap-4 mb-2">
            <ChefHatIcon className="w-12 h-12 text-emerald-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-display">
              Gênio da Cozinha
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Nos diga o que tem na sua geladeira e nós faremos mágica!
          </p>
        </header>

        <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Seus Ingredientes:</h2>
          <IngredientInput ingredients={ingredients} setIngredients={setIngredients} />
          <button
            onClick={handleGenerateRecipes}
            disabled={isLoading || ingredients.length === 0}
            className="mt-6 w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 transition-all duration-300 disabled:bg-emerald-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Spinner />
                <span>Gerando...</span>
              </>
            ) : (
              'Gerar Receitas'
            )}
          </button>
        </div>

        <div className="mt-12">
          {error && (
            <div className="text-center max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Opa!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          {isLoading && (
             <div className="text-center text-gray-600">
                <p className="text-lg animate-pulse">Nosso chef de IA está pensando em algo delicioso...</p>
            </div>
          )}
          
          {recipes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map((recipe, index) => (
                <RecipeCard key={index} recipe={recipe} userIngredients={ingredients} />
              ))}
            </div>
          )}
        </div>
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Desenvolvido com a API Gemini por Prof. Cristiano de Paula</p>
      </footer>
    </div>
  );
};

export default App;
