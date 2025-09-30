import React, { useState, useCallback } from 'react';
import { IngredientInput } from './components/IngredientInput';
import { RecipeCard } from './components/RecipeCard';
import { Spinner } from './components/Spinner';
import { ChefHatIcon } from './components/icons/ChefHatIcon';
import { generateRecipes, generateImageForRecipe } from './services/geminiService';
import { Recipe } from './types';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>(['peito de frango', 'arroz', 'brócolis']);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGeneratingText, setIsGeneratingText] = useState<boolean>(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRecipes = useCallback(async () => {
    if (ingredients.length === 0) {
      setError('Por favor, adicione pelo menos um ingrediente.');
      return;
    }

    setIsGeneratingText(true);
    setIsGeneratingImages(false);
    setError(null);
    setRecipes([]);

    try {
      // Step 1: Generate recipes text content
      const textOnlyRecipes = await generateRecipes(ingredients);
      
      if (!textOnlyRecipes || textOnlyRecipes.length === 0) {
        throw new Error("Nosso chef de IA não conseguiu criar receitas com estes ingredientes. Por favor, tente uma combinação diferente!");
      }
      
      setRecipes(textOnlyRecipes);
      setIsGeneratingText(false); // Stop main loading indicator

      // Step 2: Generate images for each recipe in the background
      setIsGeneratingImages(true);
      const imagePromises = textOnlyRecipes.map((recipe, index) =>
        generateImageForRecipe(recipe.title)
          .then(({ imageUrl }) => {
            setRecipes(currentRecipes => {
              const updatedRecipes = [...currentRecipes];
              // Check by title to prevent race conditions
              if (updatedRecipes[index]?.title === recipe.title) {
                updatedRecipes[index] = { ...updatedRecipes[index], imageUrl };
              }
              return updatedRecipes;
            });
          })
          .catch(imageError => {
            console.error(`Falha ao gerar imagem para "${recipe.title}":`, imageError);
          })
      );
      
      await Promise.allSettled(imagePromises);
      setIsGeneratingImages(false);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Desculpe, um erro inesperado ocorreu.';
      setError(errorMessage);
      setIsGeneratingText(false);
      setIsGeneratingImages(false);
    }
  }, [ingredients]);
  
  const isLoading = isGeneratingText || isGeneratingImages;

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
            {isGeneratingText ? (
              <>
                <Spinner />
                <span>Gerando Receitas...</span>
              </>
            ) : isGeneratingImages ? (
              <>
                <Spinner />
                <span>Gerando Imagens...</span>
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

          {isGeneratingText && (
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