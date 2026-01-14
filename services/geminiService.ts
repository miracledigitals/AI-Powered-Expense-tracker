import { GoogleGenAI, Modality, Chat, GenerateContentResponse } from "@google/genai";
import type { ChatMessage } from '../types';

// IMPORTANT: Do NOT configure an API KEY here.
// It is automatically provided by the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Utility to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const getExpenseSummary = async (expensesJson: string): Promise<string> => {
  const prompt = `Based on the following JSON expense data, provide a brief, insightful summary of spending habits (2-3 sentences). Highlight the top spending category and any potential areas for savings.

  Expense Data:
  ${expensesJson}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

export const editImageWithGemini = async (imageFile: File, prompt: string): Promise<string> => {
  const base64Data = await fileToBase64(imageFile);
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: imageFile.type,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated from the edit prompt.");
};

export const generateImageWithImagen = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  }
  throw new Error("Image generation failed.");
};


export const getChatbotResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    // FIX: The previous implementation was stateful and did not correctly use the history
    // passed from the component on subsequent calls. This creates a new chat session
    // with the full, correct history every time, making the function stateless and reliable.
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
            systemInstruction: "You are a friendly and helpful financial assistant for an expense tracking app. Provide concise and clear answers.",
        },
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message: newMessage });
    return response.text;
};


export const analyzeExpenses = async (expensesJson: string, prompt: string, useProModel: boolean): Promise<string> => {
  // FIX: Use the correct model name for gemini flash lite.
  const modelName = useProModel ? 'gemini-2.5-pro' : 'gemini-flash-lite-latest';
  const fullPrompt = `Here is my expense data in JSON format:\n\n${expensesJson}\n\nBased on this data, please answer the following question: ${prompt}. Provide a concise, insightful analysis.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: fullPrompt,
    ...(useProModel && {
        config: {
            thinkingConfig: { thinkingBudget: 32768 }
        }
    })
  });

  return response.text;
};