import { GoogleGenAI, Type } from "@google/genai";
import { DesignBlueprint, DesignMode, VideoFormat } from "../types";

export function getAiInstance(customKey?: string) {
  const apiKey = customKey?.trim() || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY?.trim() : null);
  return apiKey ? new GoogleGenAI({ apiKey, apiVersion: "v1" }) : null;
}

export async function verifyApiKey(key: string): Promise<{ valid: boolean; error?: string; rawError?: any }> {
  try {
    const trimmedKey = key.trim();
    if (!trimmedKey) return { valid: false, error: "Chave vazia" };
    
    // We try to use gemini-1.5-flash which is widely available on v1
    const ai = new GoogleGenAI({ apiKey: trimmedKey, apiVersion: "v1" });
    
    await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: 'user', parts: [{ text: "ping" }] }]
    });
    return { valid: true };
  } catch (err: any) {
    console.error("API Key verification failed:", err);
    const msg = err.message || String(err);
    const status = err.status || (err.response ? err.response.status : null);

    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || status === 429) {
      return { valid: false, error: "COTA_EXCEDIDA: Sua chave atingiu o limite de uso gratuito. Tente em 1 minuto.", rawError: err };
    }
    
    if (msg.includes("403") || msg.includes("400") || msg.includes("API_KEY_INVALID") || msg.includes("INVALID_ARGUMENT") || msg.includes("not valid") || status === 403 || status === 400) {
      return { 
        valid: false, 
        error: "CHAVE_INVALIDA: O Google recusou esta chave. Se você acabou de criá-la, aguarde 5 minutos para ela ativar. Verifique se copiou a chave COMPLETA e se a API do Gemini está ativada no seu console.",
        rawError: err
      };
    }

    return { valid: false, error: `ERRO DA API: ${msg}`, rawError: err };
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
    throw new Error("API KEY não encontrada. Vá em Configurações e insira sua Gemini API Key.");
  }
  
  const systemInstruction = `
    Você é um Diretor Criativo Senior (Ex-Apple, Ex-Vercel) especializado em Branding de Alto Luxo e Design de Interface.
    Sua missão é transformar um roteiro bruto em um "Design Blueprint" ultra-profissional, digno de campanhas premiadas internacionalmente.
    
    REQUISITO CRÍTICO DE IDIOMA:
    - Toda a copy gerada deve ser em PORTUGUÊS DO BRASIL.
    - Use um vocabulário sofisticado, direto e de altíssima conversão.
    
    ESTRATÉGIA DE DESIGN (ESTILO "DS COMPANY"):
    1. HIERARQUIA VISUAL: O texto principal ('text') deve ser a "Hero Statement" - curta, impactante e transformadora.
    2. NARRATIVA COMPLEMENTAR: O 'subtext' deve fornecer o contexto de autoridade ou a "prova social" que sustenta a 'text'.
    3. PALETAS DE CORES: Selecione cores HEX que transmitam autoridade. Exemplos:
       - Dark Luxury: Black Obsidian (#050505), Gold (#D4AF37), Silver (#C0C0C0).
       - Tech/Neon: Deep Blue (#0A0A1A), Electric Indigo (#6366F1), Cyber Cyan (#22D3EE).
    4. TIPOGRAFIA: Sugira fontes premium (Inter, Space Grotesk, Outfit, Playfair Display).
    5. EMOJIS COMO SÍMBOLOS: Use o 'backgroundEmoji' como um ícone minimalista e simbólico, não como decoração barata.
    
    LAYOUTS DISPONÍVEIS:
    - 'hero': Impacto bruto, centrado, tipografia gigante.
    - 'bento': Organização moderna de múltiplos dados/benefícios.
    - 'card': Destaque de produto/serviço com profundidade 3D.
    - 'feature-list': Lista de benefícios com ícones de autoridade.
    - 'gallery': Narrativa visual cinematográfica.
    - 'timeline': Processo passo-a-passo estratégico.
    - 'split': O equilíbrio perfeito entre texto e conceito visual.
    
    INSTRUÇÕES TÉCNICAS:
    - FORMATO DO VÍDEO: ${format} (Stories 9:16 ou Wide 16:9).
    - STORY_BATCH: ${isStoryBatch ? "ON - Cada cena deve ser um gancho viral independente." : "OFF - Fluxo contínuo cinematográfico."}
    - SAFE ZONES: Centralize elementos críticos. Em 9:16, ignore os 15% superiores e inferiores.
    
    PESQUISA OBRIGATÓRIA:
    Use a ferramenta Google Search para enriquecer a 'subtext' com dados reais, estatísticas de mercado ou ganchos psicológicos sobre o tópico fornecido.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: 'user', parts: [{ text: script }] }],
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
      throw new Error("COTA_EXCEDIDA: Limite de requisições atingido. Isso acontece quando muitas pessoas usam a mesma rede ou sua chave atingiu o limite gratuito. Tente novamente em 1 minuto ou gere uma chave em uma CONTA GOOGLE DIFERENTE.");
    }
    if (errorMsg.includes("403") || errorMsg.includes("PERMISSION_DENIED")) {
      throw new Error("ERRO_PERMISSAO: Sua chave API não tem permissão para usar este modelo. Verifique se o Gemini 1.5 Flash está habilitado e se a chave está ativa.");
    }
    throw new Error(`ERRO_API: ${errorMsg}`);
  }
}
