import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        if (!process.env.API_KEY) {
            throw new Error("A variável de ambiente API_KEY não está configurada.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const { ingredients } = req.body;

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Os ingredientes devem ser um array não vazio.' });
        }
        
        const systemInstruction = "Você é um chef de cozinha mestre, especialista em criar receitas incríveis com um conjunto limitado de ingredientes. Sua tarefa é gerar uma lista de receitas em formato JSON, seguindo estritamente o schema fornecido. Responda sempre em Português do Brasil.";
        const userPrompt = `Gere 3 receitas criativas e distintas usando principalmente os seguintes ingredientes: ${ingredients.join(', ')}. Você pode assumir que ingredientes básicos como sal, pimenta, azeite e água estão disponíveis.`;
        const fullPrompt = `${systemInstruction}\n\n---\n\n${userPrompt}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });

        let responseText = response.text;
        if (!responseText) {
            throw new Error("Recebida uma resposta vazia da API de receitas.");
        }

        // Clean potential markdown formatting
        responseText = responseText.trim();
        if (responseText.startsWith('```json')) {
            responseText = responseText.slice(7).trim();
        } else if (responseText.startsWith('```')) {
            responseText = responseText.slice(3).trim();
        }
        if (responseText.endsWith('```')) {
            responseText = responseText.slice(0, -3).trim();
        }
        
        // Additional check to ensure response is likely JSON before parsing
        if (!responseText.startsWith('[') && !responseText.startsWith('{')) {
            console.error("Gemini response was not in expected JSON format:", responseText);
            throw new Error("A resposta da IA não estava no formato JSON esperado. Por favor, tente novamente.");
        }
        
        const recipes = JSON.parse(responseText);
        res.status(200).json(recipes);

    } catch (error) {
        console.error("Erro na função serverless 'generate-recipes':", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
        res.status(500).json({ error: `Falha ao gerar receitas: ${errorMessage}` });
    }
}
