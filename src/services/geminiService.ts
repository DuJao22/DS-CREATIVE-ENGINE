import { GoogleGenAI, Type } from "@google/genai";
import { DesignBlueprint, DesignMode, VideoFormat } from "../types";

export function getAiInstance(customKey?: string) {
  const apiKey = customKey || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : null);
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}

export async function verifyApiKey(key: string): Promise<boolean> {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "ping"
    });
    return true;
  } catch (err) {
    console.error("API Key verification failed:", err);
    return false;
  }
}

export async function generateDesignBlueprint(
  script: string,
  mode: DesignMode,
  format: VideoFormat,
  customApiKey?: string,
  isStoryBatch: boolean = false
): Promise<DesignBlueprint> {
  const ai = getAiInstance(customApiKey);
  if (!ai) {
    throw new Error("GEMINI_API_KEY não configurada. Adicione sua chave nas configurações.");
  }
  const prompt = `
    Transform the following video script into a professional animated creative blueprint.
    
    SCRIPT:
    ${script}
    
    MODE: ${mode}
    FORMAT: ${format}
    STORY_BATCH_MODE: ${isStoryBatch ? "ON - Each scene should be a complete independent hook/take for a single story post." : "OFF - Continuous video flow."}
    
    INSTRUCTIONS:
    1. Divide the script into logical scenes (3-7 scenes).
    2. Act as a world-class UI/UX Motion Designer (Apple/Vercel style).
    3. For each scene, choose a sophisticated layoutType:
       - 'hero': Large headline, subtext, and clear visual hierarchy.
       - 'bento': Modern grid-like layout for feature highlights.
       - 'card': Clean floating card elements with high shadows.
       - 'feature-list': Clean list of benefits with icons (emoji).
       - 'gallery': A 3-column masonry/grid style for visual variety.
       - 'timeline': A structured vertical journey or step-by-step flow.
       - 'split': Professional 50/50 balance.
    4. Provide a 'subtext' that complements the main 'text' for richer storytelling.
    5. High-impact scenes should use 'stagger' or 'blur-reveal'.
    6. Ensure colors are highly sophisticated and contrast well.
    7. Each scene should feel like a perfectly designed landing page section.
    ${isStoryBatch ? "8. Each scene must be a complete, independent high-converting story post." : ""}
    
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
                subtext: { type: Type.STRING },
                highlightWords: { type: Type.ARRAY, items: { type: Type.STRING } },
                animation: { type: Type.STRING, enum: ["fade", "zoom", "typewriter", "slide-up", "glitch", "blur-reveal", "stagger"] },
                duration: { type: Type.NUMBER },
                layoutType: { type: Type.STRING, enum: ["centered", "top", "bottom", "split", "bento", "hero", "card", "feature-list", "gallery", "timeline"] },
                impact: { type: Type.STRING, enum: ["low", "medium", "high"] },
                backgroundEmoji: { type: Type.STRING },
                ctaText: { type: Type.STRING }
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
