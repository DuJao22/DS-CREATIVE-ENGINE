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
    Você é um Diretor Criativo Senior (Ex-Apple, Ex-Vercel) e Estrategista de Design.
    Sua missão é transformar um roteiro em um blueprint de design ultra-profissional para vídeos/stories de alta conversão.
    
    REQUISITO CRÍTICO: 
    1. Toda a copy gerada (campos 'text', 'subtext', 'ctaText') DEVE ser em PORTUGUÊS DO BRASIL.
    2. O tom deve ser profissional, persuasivo e sofisticado.
    
    FILOSOFIA DE DESIGN:
    - EXCELLENCE: Cada cena deve parecer uma landing page de luxo. No generic text.
    - TYPOGRAPHY: Use bold, high-contrast typography. Use specific 'fontFamily' names like 'Inter', 'Space Grotesk', 'Outfit', or 'Playfair Display'.
    - HIERARCHY: Use 'subtext' for secondary details. Ensure the 'text' is punchy and high-impact.
    - COLOR THEORY: Select sophisticated palettes (e.g., Deep Charcoal & Electric Indigo, Cream & Forest Green, Midnight Black & Gold).
    - SAFE ZONES: For ${format}, avoid placing text in the top/bottom 15%. Keep critical elements central.
    - VISUAL METAPHORS: Use 'backgroundEmoji' creatively as a visual anchor or metaphor for the scene's content.
    - LAYOUTS:
       - 'hero': Direct, bold impact.
       - 'bento': Modern, structured data/feature presentation.
       - 'card': Focused, elegant product/service highlight in 3D.
       - 'feature-list': Benefit-driven, scannable layout.
       - 'gallery': Visual storytelling with multiple assets.
       - 'timeline': Process or story progression.
       - 'split': Professional contrast between copy and metaphor.
    
    COPYWRITING:
    - Transform the user's input into professional, persuasive, and punchy marketing copy in Portuguese.
    - If the user provides a brief topic, research it using Google Search to provide factual, deep, and expert-level subtext.
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
