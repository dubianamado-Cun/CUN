
import { GoogleGenAI } from "@google/genai";

// FIX: Per Gemini API guidelines, initialize client directly with process.env.API_KEY
// and remove manual key checks. The SDK is expected to handle it.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInsights = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `An error occurred while generating insights: ${error.message}`;
    }
    return "An unknown error occurred while generating insights.";
  }
};
