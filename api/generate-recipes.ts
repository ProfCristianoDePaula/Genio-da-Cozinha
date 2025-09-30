import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "O nome da receita." },
        description: { type: Type.STRING, description: "Uma descrição curta e atraente do prato." },
        prepTime: { type: Type.STRING, description: "Tempo de preparo estimado, ex: '15 minutos'." },
        cookTime: { type: Type.STRING, description: "Tempo de cozimento estimado, ex: '30 minutos'." },
        ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de todos os ingredientes." },
        instructions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Instruções passo a passo." },
      },
      required: ["title", "description", "prepTime", "cookTime", "ingredients", "instructions"],
    },
};

async function getRecipesFromGemini(ingredients: string[]): Promise<Omit<Recipe, 'imageUrl'>[]> {
    const prompt = `Com base nos seguintes ingredientes: ${ingredients.join(', ')}, gere 3 receitas distintas em Português do Brasil. Inclua ingredientes básicos (sal, pimenta, óleo). Forneça título, descrição, tempo de preparo, tempo de cozimento, ingredientes e instruções. Formate a resposta como JSON conforme o schema.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: recipeSchema },
    });

    const responseText = response.text;
    if (!responseText) {
        throw new Error("Recebida uma resposta vazia da API de receitas.");
    }
    return JSON.parse(responseText);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: 'Ingredients must be a non-empty array.' });
    }

    try {
        const recipes = await getRecipesFromGemini(ingredients);
        res.status(200).json(recipes);
    } catch (error) {
        console.error("Error in serverless function:", error);
        res.status(500).json({ error: 'Failed to generate recipes from Gemini API.' });
    }
}
