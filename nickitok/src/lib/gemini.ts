import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function analyzeImage(base64Data: string, mimeType: string, prompt: string = "Analyze this image and provide a brief description for a social media post.") {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt }
        ]
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

export async function generateQuickThought(context: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-latest",
      contents: `Generate a short, engaging social media "thought" (max 100 characters) about: ${context}`
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Thought Generation Error:", error);
    return "";
  }
}
