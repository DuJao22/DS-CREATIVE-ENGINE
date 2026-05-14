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
  
  const systemInstruction = `
    You are a world-class researcher and Creative Director.
    Your goal is to transform a script into a professional animated creative blueprint.
    
    STORY_BATCH_MODE: ${isStoryBatch ? "ON" : "OFF"}
    VIDEO_FORMAT: ${format}
    
    INSTRUCTIONS:
    1. RESEARCH: Use Google Search to find professional context about the topic.
    2. SCENES: 3-7 scenes. High-end landing page style.
    3. LAYOUTS: 'hero', 'bento', 'card', 'feature-list', 'gallery', 'timeline', 'split'.
    4. ACCESSIBILITY: Ensure high contrast (AA/AAA) between text and background.
    5. SAFE ZONES: For 9:16, avoid top/bottom 15%.
    6. SUBTEXT: Enrich scenes with professional subtext.
    7. EMOJIS: Use context-aware emojis for backgrounds.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: script,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          required: ["id", "mode", "format", "scenes", "colors", "fontFamily"],
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            mode: { type: Type.STRING, enum: ["ULTRA_VIRAL", "MINIMALIST", "CINEMATIC", "DARK_LUXURY", "NEON_TECH"] },
            format: { type: Type.STRING, enum: ["9:16", "16:9"] },
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
  } catch (err: any) {
    const errorMsg = err.message || String(err);
    if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("COTA_EXCEDIDA: Esta chave (ou este IP) atingiu o limite de requisições. Tente novamente em 1 minuto ou gere uma chave em uma nova conta/projeto Google.");
    }
    if (errorMsg.includes("403") || errorMsg.includes("PERMISSION_DENIED")) {
      throw new Error("ERRO_PERMISSAO: Sua chave API não tem permissão para usar este modelo ou recurso. Verifique se o Gemini 3 Flash está habilitado no seu Google AI Studio.");
    }
    throw new Error(`ERRO_API: ${errorMsg}`);
  }
}
