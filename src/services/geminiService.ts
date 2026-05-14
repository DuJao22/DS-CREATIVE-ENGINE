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
    You are a world-class researcher and Creative Director at a top-tier design agency.
    Your goal is to transform a script or topic into a professional animated creative blueprint.
    
    STORY_BATCH_MODE: ${isStoryBatch ? "ON - Each scene should be a complete independent hook/take for a single story post." : "OFF - Continuous video flow."}
    VIDEO_FORMAT: ${format} (Ensure all elements fit within this aspect ratio and safe zones).
    
    INSTRUCTIONS:
    1. RESEARCH & EXPAND: If the user provided a brief topic, research it using Google Search to find relevant facts, emotions, and professional context. Enrich the script with this knowledge to create deeper storytelling.
    2. SCENE DIVISION: Divide the content into 3-7 logical scenes.
    3. VISUAL HIERARCHY: Each scene must look like a high-end landing page. Use layoutTypes: 'hero', 'bento', 'card', 'feature-list', 'gallery', 'timeline', 'split', 'centered', 'top', 'bottom'.
    4. COLOR THEORY & CONTRAST: Select sophisticated hex colors. You MUST ensure AA/AAA contrast ratios between text and background. 
       - Background should be dark for DARK_LUXURY/NEON_TECH.
       - Accents should pop but remain legible.
    5. FRAMING & SAFE ZONES: 
       - For 9:16 (Stories): Avoid placing critical text in the top 15% and bottom 15% (where UI overlays typically appear).
       - Ensure text is centered and doesn't get cut off by screen edges.
    6. MOTION DESIGN: Use 'stagger' or 'blur-reveal' for high-impact scenes.
    7. SUBTEXT: Provide a 'subtext' that complements the main 'text' for richer storytelling.
    8. Each scene should have a unique 'backgroundEmoji' that fits the context discovered in your research.
    ${isStoryBatch ? "9. Ensure each scene is a self-contained, high-converting story post." : ""}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: script,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      toolConfig: { includeServerSideToolInvocations: true },
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
}
