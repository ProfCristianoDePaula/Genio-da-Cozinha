import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function getImageFromGemini(recipeTitle: string): Promise<string> {
    const prompt = `Uma foto de comida profissional, de alta qualidade e apetitosa de "${recipeTitle}". O prato deve estar bem apresentado, com iluminação de estúdio e um fundo limpo e desfocado. Aspecto de foto de cardápio.`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '4:3' },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("Nenhuma imagem foi gerada.");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { title } = req.body;

    if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title must be a non-empty string.' });
    }

    try {
        const imageUrl = await getImageFromGemini(title);
        res.status(200).json({ imageUrl });
    } catch (error) {
        console.error(`Failed to generate image for "${title}":`, error);
        res.status(500).json({ error: 'Failed to generate image from Gemini API.' });
    }
}
