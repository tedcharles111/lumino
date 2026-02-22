import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAiClient() {
  let apiKey = process.env.GEMINI_API_KEY;
  
  // Fallback to VITE_ prefixed var if process.env one is missing/undefined
  if (!apiKey && typeof import.meta !== 'undefined' && import.meta.env) {
    apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  }

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please configure it in your environment variables.");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function editImage(
  imageBase64: string,
  prompt: string
): Promise<string> {
  try {
    const client = getAiClient();
    
    // Remove data:image/png;base64, prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Find the image part in the response
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated");
  } catch (error) {
    console.error("Gemini Edit Error:", error);
    throw error;
  }
}
