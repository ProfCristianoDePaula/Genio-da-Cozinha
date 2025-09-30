import { Recipe } from '../types';

export async function generateRecipes(ingredients: string[]): Promise<Recipe[]> {
  try {
    const response = await fetch('/api/generate-recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `O servidor respondeu com o status ${response.status}`);
    }

    const recipes: Recipe[] = await response.json();
    return recipes;

  } catch (error) {
    console.error("Erro ao buscar receitas do backend:", error);
    throw new Error("Falha ao comunicar com nosso servidor. Por favor, tente novamente.");
  }
}

export async function generateImageForRecipe(title: string): Promise<{ imageUrl: string }> {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

     if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `O servidor respondeu com o status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
     console.error(`Erro ao gerar imagem para "${title}":`, error);
     throw new Error(`Falha ao gerar a imagem para ${title}.`);
  }
}
