import { GoogleGenAI } from "@google/genai";

export async function generateBusinessAnalysis(systemInstruction: string, content: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is required");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: content,
    config: {
      systemInstruction,
    },
  });

  return response.text ?? "No se pudo generar una respuesta.";
}
