import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "O nome da receita."
        },
        description: {
          type: Type.STRING,
          description: "Uma descrição curta e atraente do prato."
        },
        prepTime: {
          type: Type.STRING,
          description: "Tempo de preparo estimado, ex: '15 minutos'."
        },
        cookTime: {
          type: Type.STRING,
          description: "Tempo de cozimento estimado, ex: '30 minutos'."
        },
        ingredients: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "Um único ingrediente com sua quantidade."
          },
          description: "Uma lista de todos os ingredientes necessários para a receita."
        },
        instructions: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "Um único passo nas instruções de preparo."
          },
          description: "Instruções passo a passo de como preparar o prato."
        },
      },
      required: ["title", "description", "prepTime", "cookTime", "ingredients", "instructions"],
    },
};

export async function generateRecipes(ingredients: string[]): Promise<Recipe[]> {
  const prompt = `Com base nos seguintes ingredientes: ${ingredients.join(', ')}, gere 3 receitas distintas em Português do Brasil. 
  Sinta-se à vontade para incluir ingredientes básicos comuns como óleo, sal, pimenta, farinha, açúcar e água. 
  Para cada receita, forneça um título, uma breve descrição, tempo total de preparo, tempo total de cozimento, uma lista de todos os ingredientes necessários e instruções passo a passo. 
  Por favor, formate a resposta como um objeto JSON que corresponda ao schema fornecido.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Recebida uma resposta vazia da API.");
    }

    const recipes: Recipe[] = JSON.parse(responseText);
    return recipes;

  } catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error("Falha ao gerar receitas da API Gemini.");
  }
}

export async function generateRecipeImage(recipeTitle: string): Promise<string> {
  const prompt = `Uma foto de comida profissional, de alta qualidade e apetitosa de "${recipeTitle}". O prato deve estar bem apresentado, com iluminação de estúdio e um fundo limpo e desfocado. Aspecto de foto de cardápio.`;

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '4:3',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("Nenhuma imagem foi gerada.");
    }

  } catch (error) {
    console.error(`Error generating image for "${recipeTitle}":`, error);
    throw new Error(`Falha ao gerar imagem para a receita "${recipeTitle}".`);
  }
}