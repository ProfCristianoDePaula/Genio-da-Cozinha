import { Recipe } from '../types';

async function handleResponseError(response: Response): Promise<Error> {
    // Default message
    let errorMessage = `O servidor respondeu com o status ${response.status}`;
    try {
        const errorData = await response.json();
        // Use the specific error from our API if available
        if (errorData && errorData.error) {
            return new Error(errorData.error);
        }
    } catch (e) {
        // The response was not JSON. It might be a Vercel deployment error page.
        // In this case, the default message is appropriate.
        console.error("A resposta do servidor não era JSON. Status:", response.status);
    }
    return new Error(errorMessage);
}

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
        throw await handleResponseError(response);
    }

    const recipes: Recipe[] = await response.json();
    return recipes;

  } catch (error) {
    console.error("Erro ao buscar receitas do backend:", error);
    // Re-throw the error to be handled by the component. 
    // The message is now more specific thanks to handleResponseError.
    throw error;
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
        throw await handleResponseError(response);
    }
    
    return await response.json();
  } catch (error) {
     console.error(`Erro ao gerar imagem para "${title}":`, error);
     // Re-throw for the component.
     throw error;
  }
}
