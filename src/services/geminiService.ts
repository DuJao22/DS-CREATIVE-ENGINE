import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { DesignBlueprint, DesignMode, VideoFormat } from "../types";

export function getAiInstance(customKey?: string) {
  const apiKey = customKey?.trim() || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY?.trim() : null);
  return apiKey ? new GoogleGenerativeAI(apiKey) : null;
}

export async function verifyApiKey(key: string): Promise<{ valid: boolean; error?: string; rawError?: any }> {
  const trimmedKey = key.trim();
  if (!trimmedKey) return { valid: false, error: "Chave vazia" };

  // Models to try in order of preference
  const testModels = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];
  let lastError: any = null;

  for (const modelName of testModels) {
    try {
      const genAI = new GoogleGenerativeAI(trimmedKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      await model.generateContent("ping");
      return { valid: true };
    } catch (err: any) {
      lastError = err;
      const msg = err.message || String(err);
      
      // If it's a quota error, we stop and report it
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        return { valid: false, error: "COTA_EXCEDIDA: Sua chave atingiu o limite de uso gratuito. Tente em 1 minuto.", rawError: err };
      }
      
      // If it's not a 404 (model not found), it's likely an invalid key error
      if (!msg.includes("404") && !msg.includes("not found")) {
        break; 
      }
      // If it IS a 404, we continue to the next model in the list
    }
  }

  console.error("API Key verification failed:", lastError);
  const msg = lastError?.message || String(lastError);
  
  if (msg.includes("403") || msg.includes("400") || msg.includes("API_KEY_INVALID") || msg.includes("not valid")) {
    return { 
      valid: false, 
      error: "CHAVE_INVALIDA: O Google recusou esta chave. Verifique se copiou a chave COMPLETA e se ela está ativa no Google AI Studio.",
      rawError: lastError
    };
  }

  if (msg.includes("404") || msg.includes("not found")) {
    return {
      valid: false,
      error: "ERRO DE MODELO: Os modelos Gemini não foram encontrados para esta chave. Verifique se sua conta tem acesso à API Generative Language.",
      rawError: lastError
    };
  }

  return { valid: false, error: `ERRO DA API: ${msg}`, rawError: lastError };
}

export async function generateDesignBlueprint(
  script: string,
  mode: DesignMode,
  format: VideoFormat,
  customApiKey?: string,
  isStoryBatch: boolean = false
): Promise<DesignBlueprint> {
  const genAI = getAiInstance(customApiKey);
  if (!genAI) {
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
  `;

  try {
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            required: ["id", "mode", "format", "scenes", "colors", "fontFamily"],
            properties: {
              id: { type: SchemaType.STRING },
              name: { type: SchemaType.STRING },
              mode: { type: SchemaType.STRING, format: "enum", enum: ["ULTRA_VIRAL", "MINIMALIST", "CINEMATIC", "DARK_LUXURY", "NEON_TECH"] },
              format: { type: SchemaType.STRING, format: "enum", enum: ["9:16", "16:9"] },
              fontFamily: { type: SchemaType.STRING },
              isStoryBatch: { type: SchemaType.BOOLEAN },
              colors: {
                type: SchemaType.OBJECT,
                required: ["primary", "secondary", "accent", "background"],
                properties: {
                  primary: { type: SchemaType.STRING },
                  secondary: { type: SchemaType.STRING },
                  accent: { type: SchemaType.STRING },
                  background: { type: SchemaType.STRING },
                }
              },
              scenes: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  required: ["id", "text", "highlightWords", "animation", "duration", "layoutType", "impact"],
                  properties: {
                    id: { type: SchemaType.STRING },
                    text: { type: SchemaType.STRING },
                    subtext: { type: SchemaType.STRING },
                    highlightWords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    animation: { type: SchemaType.STRING, format: "enum", enum: ["fade", "zoom", "typewriter", "slide-up", "glitch", "blur-reveal", "stagger"] },
                    duration: { type: SchemaType.NUMBER },
                    layoutType: { type: SchemaType.STRING, format: "enum", enum: ["centered", "top", "bottom", "split", "bento", "hero", "card", "feature-list", "gallery", "timeline"] },
                    impact: { type: SchemaType.STRING, format: "enum", enum: ["low", "medium", "high"] },
                    backgroundEmoji: { type: SchemaType.STRING },
                    ctaText: { type: SchemaType.STRING }
                  }
                }
              },
              soundHint: { type: SchemaType.STRING }
            }
          }
        }
      });

      const result = await model.generateContent(script);
      const response = await result.response;
      const text = response.text();
      
      if (!text) throw new Error("Could not generate blueprint");
      
      return JSON.parse(text) as DesignBlueprint;
    } catch (err: any) {
      lastError = err;
      const msg = err.message || String(err);
      
      // If it's not a 404, we don't try other models (likely a different error like quota or content filter)
      if (!msg.includes("404") && !msg.includes("not found")) {
        break;
      }
      // If it is a 404, try next model
      console.warn(`Model ${modelName} not found, trying next...`);
    }
  }

  // If we reach here, either it was a fatal error or all models failed with 404
  const finalErrorMsg = lastError?.message || String(lastError);
  console.error("Gemini Generation Error:", lastError);

  if (finalErrorMsg.includes("429") || finalErrorMsg.includes("RESOURCE_EXHAUSTED")) {
    throw new Error("COTA_EXCEDIDA: Limite de requisições atingido. Tente novamente em 1 minuto.");
  }
  if (finalErrorMsg.includes("403") || finalErrorMsg.includes("PERMISSION_DENIED")) {
    throw new Error("ERRO_PERMISSAO: Sua chave API não tem permissão para usar este modelo.");
  }
  
  throw new Error(`ERRO_API: ${finalErrorMsg}`);
  } catch (globalErr: any) {
    throw globalErr;
  }
}

