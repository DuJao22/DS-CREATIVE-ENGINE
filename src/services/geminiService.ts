import { GoogleGenAI, Type } from "@google/genai";
import { DesignBlueprint, DesignMode, VideoFormat } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateDesignBlueprint(
  script: string,
  mode: DesignMode,
  format: VideoFormat,
  isStoryBatch: boolean = false
): Promise<DesignBlueprint> {
  const prompt = `
    Transform the following video script into a professional animated creative blueprint.
    
    SCRIPT:
    ${script}
    
    MODE: ${mode}
    FORMAT: ${format}
    STORY_BATCH_MODE: ${isStoryBatch ? "ON - Each scene should be a complete independent hook/take for a single story post." : "OFF - Continuous video flow."}
    
    INSTRUCTIONS:
    1. Divide the script into logical scenes (3-7 scenes usually).
    2. Suggest specific animations for each scene based on the text emotion.
    3. Highlight 2-3 impact words per scene.
    4. Provide hex colors that match the chosen MODE.
    5. Ensure the layoutType fits the text length.
    ${isStoryBatch ? "6. Ensure each scene is self-contained and high-impact." : ""}
    
    The output must strictly follow the DesignBlueprint schema.
    IMPORTANT: Provide a unique "id" for the blueprint (random string).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["id", "mode", "format", "scenes", "colors", "fontFamily"],
        properties: {
          id: { type: Type.STRING },
          mode: { type: Type.STRING },
          format: { type: Type.STRING },
          fontFamily: { type: Type.STRING },
          isStoryBatch: { type: Type.BOOLEAN },
          colors: {
            type: Type.OBJECT,
            required: ["primary", "secondary", "accent", "background"],
            properties: {
              primary: { type: Type.STRING },
              secondary: { type: Type.STRING },
              accent: { type: Type.STRING },
              background: { type: Type.STRING },
            }
          },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["id", "text", "highlightWords", "animation", "duration", "layoutType", "impact"],
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                highlightWords: { type: Type.ARRAY, items: { type: Type.STRING } },
                animation: { type: Type.STRING, enum: ["fade", "zoom", "typewriter", "slide-up", "glitch", "blur-reveal", "stagger"] },
                duration: { type: Type.NUMBER },
                layoutType: { type: Type.STRING, enum: ["centered", "top", "bottom", "split"] },
                impact: { type: Type.STRING, enum: ["low", "medium", "high"] },
                backgroundEmoji: { type: Type.STRING }
              }
            }
          },
          soundHint: { type: Type.STRING }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Could not generate blueprint");
  
  return JSON.parse(text) as DesignBlueprint;
}
