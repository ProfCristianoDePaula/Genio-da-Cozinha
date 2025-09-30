import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        if (!process.env.API_KEY) {
            throw new Error("A variável de ambiente API_KEY não está configurada.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const { title } = req.body;

        if (!title || typeof title !== 'string') {
            return res.status(400).json({ error: 'O título deve ser uma string não vazia.' });
        }
        
        const prompt = `Uma foto de comida profissional, de alta qualidade e apetitosa de "${title}". O prato deve estar bem apresentado, com iluminação de estúdio e um fundo limpo e desfocado. Aspecto de foto de cardápio.`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '4:3' },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            res.status(200).json({ imageUrl });
        } else {
            throw new Error("Nenhuma imagem foi gerada.");
        }

    } catch (error) {
        console.error(`Erro na função serverless 'generate-image' para "${req.body?.title}":`, error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
        res.status(500).json({ error: `Falha ao gerar imagem: ${errorMessage}` });
    }
}
