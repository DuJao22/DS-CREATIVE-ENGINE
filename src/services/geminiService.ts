import { GoogleGenAI, Type } from "@google/genai";
import { DesignBlueprint, DesignMode, VideoFormat } from "../types";

export function getAiInstance(customKey?: string) {
  const apiKey = customKey?.trim() || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY?.trim() : null);
  // Important: gemini-api skill says to always call from frontend and use GoogleGenAI
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}

export async function verifyApiKey(key: string): Promise<{ valid: boolean; error?: string; rawError?: any }> {
  const trimmedKey = key.trim();
  if (!trimmedKey) return { valid: false, error: "Chave vazia" };

  // Use the alias from skill: 'gemini-flash-latest'
  const testModels = ["gemini-flash-latest", "gemini-2.0-flash"];
  let lastError: any = null;
  
  for (const modelName of testModels) {
    try {
      const ai = new GoogleGenAI({ apiKey: trimmedKey });
      await ai.models.generateContent({
        model: modelName,
        contents: "ping",
      });
      return { valid: true };
    } catch (err: any) {
      lastError = err;
      const msg = (err.message || String(err)).toUpperCase();
      
      // If it's a quota error, we stop immediately.
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        return { 
          valid: false, 
          error: "COTA_EXCEDIDA: Sua chave atingiu o limite de uso gratuito. Aguarde 60 segundos antes de tentar novamente.", 
          rawError: err 
        };
      }
      
      if (msg.includes("API_KEY_INVALID") || msg.includes("KEY NOT VALID") || msg.includes("401")) {
        return { 
          valid: false, 
          error: "CHAVE_INVALIDA: O Google recusou esta chave. Verifique se copiou a chave completa.",
          rawError: err
        };
      }

      if (msg.includes("403") || msg.includes("PERMISSION_DENIED")) {
        // Try next model if permission denied for this specific one
        continue;
      }
      
      // If it's a 404, try next
      if (msg.includes("404") || msg.includes("NOT_FOUND")) {
        continue;
      }
    }
  }

  const finalMsg = (lastError?.message || String(lastError)).toUpperCase();
  if (finalMsg.includes("403") || finalMsg.includes("PERMISSION_DENIED")) {
    return {
      valid: false,
      error: "ERRO_PERMISSAO: Sua chave é válida, mas não tem acesso aos modelos Flash. Verifique no AI Studio.",
      rawError: lastError
    };
  }

  return { valid: false, error: `ERRO DA API: ${finalMsg}`, rawError: lastError };
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
    
    REQUISITO CRÍTICO DE CONTEÚDO E IDIOMA:
    - Toda a copy gerada deve ser em PORTUGUÊS DO BRASIL.
    - FIDELIDADE MÁXIMA: Você NÃO deve resumir ou criar textos genéricos. Use EXATAMENTE a lógica e os dados fornecidos no roteiro do usuário.
    - Se o usuário fornecer um passo-a-passo (como "Abra o site x", "Clique em y"), transforme cada passo em uma cena específica e visualmente impactante.
    - PROFISSIONALISMO: Use um vocabulário sofisticado, direto e de altíssima conversão.
    
    AUTORIDADE VISUAL (ESTILO "DS COMPANY"):
    1. HIERARQUIA VISUAL: O texto principal ('text') é a sua manchete. Deve ser curto, mas fiel ao conteúdo original.
    2. NARRATIVA COMPLEMENTAR: O 'subtext' deve conter detalhes técnicos, explicações ou instruções adicionais vindas do roteiro.
    3. ESTRUTURA DE LISTA (TÓPICOS 1, 2, 3): Se o roteiro contém uma sequência de passos ou lista, use o layout 'timeline'. 
       - OBRIGATÓRIO: Preencha o array 'listItems' com no mínimo 3 itens se o conteúdo permitir.
       - ESCRITA RELACIONADA: O conteúdo de 'title' e 'description' deve ser 100% relacionado ao roteiro e escrito de forma profissional e detalhada.
    4. DESIGN GENERATIVO: Selecione a combinação PERFEITA de Layout, Animação e Impacto para cada trecho do texto.
    5. PALETAS DE CORES: Selecione cores HEX que transmitam autoridade. Estética Minimal-High-Contrast. Backgrounds escuros (#000000).
    
    LAYOUTS ESTRATÉGICOS:
    - 'hero': Para frases de impacto ou títulos principais.
    - 'timeline': OBRIGATÓRIO para tutoriais, processos passo-a-passo ou listas de tópicos numerados (1, 2, 3).
    - 'feature-list': Para listar benefícios ou recursos técnicos.
    - 'bento': Para mostrar múltiplos recursos simultaneamente.
    - 'card': Para destacar um produto ou elemento central.
    - 'split': Equilíbrio visual entre texto longo e foco em palavra-chave.
    
    INSTRUÇÕES TÉCNICAS:
    - FORMATO DO VÍDEO: ${format} (Stories 9:16 ou Wide 16:9).
    - STORY_BATCH: ${isStoryBatch ? "ON - Cada cena deve ser um gancho viral independente." : "OFF - Fluxo contínuo cinematográfico."}
    - SAFE ZONES: Centralize elementos críticos. Em 9:16, ignore os 15% superiores e inferiores.
    - ECONOMIA: Gere entre 5 a 15 cenas no máximo. Seja conciso no JSON.
  `;

  // Use aliases according to skill
  const modelsToTry = ["gemini-flash-latest", "gemini-2.0-flash", "gemini-3-flash-preview"];
  let lastError: any = null;

  const sanitizedScript = script.substring(0, 15000);
  console.log(`Starting generation with mode: ${mode}, format: ${format}`);

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: sanitizedScript,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
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
                    ctaText: { type: Type.STRING },
                    listItems: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: ["id", "title"],
                        properties: {
                          id: { type: Type.STRING },
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          icon: { type: Type.STRING }
                        }
                      }
                    }
                  }
                }
              },
              soundHint: { type: Type.STRING }
            }
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("A API retornou uma resposta vazia.");
      
      try {
        const parsed = JSON.parse(text);
        return parsed as DesignBlueprint;
      } catch (parseErr: any) {
        throw new Error(`ERRO_FORMATO: A resposta da IA veio incompleta. Use um roteiro mais curto.`);
      }
    } catch (err: any) {
      lastError = err;
      const msg = err.message || String(err);
      
      // Retry logic for 429
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        console.warn("Quota exceeded, skipping to next model or reporting...");
        // On 429 with own key, usually the whole project is limited, so we break
        break;
      }

      if (msg.includes("ERRO_FORMATO")) break;
      if (msg.includes("403") || msg.includes("PERMISSION_DENIED")) continue;
      if (!msg.includes("404") && !msg.includes("NOT_FOUND")) break;
    }
  }

  const finalErrorMsg = lastError?.message || String(lastError);
  if (finalErrorMsg.includes("429") || finalErrorMsg.includes("RESOURCE_EXHAUSTED")) {
    throw new Error("COTA_EXCEDIDA: Sua chave atingiu o limite. Aguarde 60 segundos.");
  }
  
  throw new Error(`ERRO_API: ${finalErrorMsg}`);
}
