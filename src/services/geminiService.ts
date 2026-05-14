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

  // Models to try in order of preference
  const testModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
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
      const msg = err.message || String(err);
      
      // If it's a quota error, we stop and report it
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        return { valid: false, error: "COTA_EXCEDIDA: Sua chave atingiu o limite de uso gratuito. Tente em 1 minuto.", rawError: err };
      }
      
      // If it's a permission denied, key is likely invalid or wrong project
      if (msg.includes("403") || msg.includes("PERMISSION_DENIED") || msg.includes("API_KEY_INVALID")) {
        break;
      }

      // If it's not a 404 (model not found), it's likely a fatal error
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
      error: "ERRO DE MODELO: Nenhum modelo disponível foi encontrado para esta chave. Verifique se sua conta tem acesso à API no Google AI Studio.",
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
    - Use um vocabulário sofisticado, direto e de altíssima conversão.
    
    AUTORIDADE VISUAL (ESTILO "DS COMPANY"):
    1. HIERARQUIA VISUAL: O texto principal ('text') é a sua manchete. Deve ser curto, mas fiel ao conteúdo original.
    2. NARRATIVA COMPLEMENTAR: O 'subtext' deve conter detalhes técnicos, explicações ou instruções adicionais.
    3. ESTRUTURA DE LISTA: Se você usar o layout 'timeline' ou 'feature-list', você DEVE preencher o array 'listItems' com itens extraídos do roteiro. Cada item deve ter um 'title' (impactante) e uma 'description' (explicativa/detalhada). Use no mínimo 3 itens se o conteúdo permitir.
    4. DESIGN GENERATIVO: Selecione a combinação PERFEITA de Layout, Animação e Impacto para cada trecho do texto.
    5. PALETAS DE CORES: Selecione cores HEX que transmitam autoridade. Extremamente importante usar preto puro (#000000) ou quase preto (#050505) como background em temas Luxury/Dark.
    
    LAYOUTS ESTRATÉGICOS:
    - 'hero': Para frases de impacto ou títulos principais.
    - 'timeline': OBRIGATÓRIO para tutoriais, processos passo-a-passo ou listas de tópicos numerados (1, 2, 3).
    - 'feature-list': Para listar benefícios ou características técnicas.
    - 'bento': Para mostrar múltiplos recursos simultaneamente.
    - 'card': Para destacar um produto ou elemento central.
    - 'split': Equilíbrio visual entre texto longo e foco em palavra-chave.
    
    INSTRUÇÕES TÉCNICAS:
    - FORMATO DO VÍDEO: ${format} (Stories 9:16 ou Wide 16:9).
    - STORY_BATCH: ${isStoryBatch ? "ON - Cada cena deve ser um gancho viral independente." : "OFF - Fluxo contínuo cinematográfico."}
    - SAFE ZONES: Centralize elementos críticos. Em 9:16, ignore os 15% superiores e inferiores.
    - ECONOMIA: Gere entre 5 a 15 cenas no máximo. Seja conciso no JSON.
  `;

  const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-8b"];
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

      console.log(`Response received from ${modelName}`);
      const text = response.text;
      if (!text) throw new Error("A API retornou uma resposta vazia.");
      
      try {
        const parsed = JSON.parse(text);
        console.log("Blueprint generated successfully");
        return parsed as DesignBlueprint;
      } catch (parseErr: any) {
        console.error("JSON Parse Error. Data length:", text.length, "Preview:", text.substring(0, 200));
        throw new Error(`ERRO_FORMATO: A resposta da IA veio incompleta ou malformada. Tente usar um roteiro mais curto.`);
      }
    } catch (err: any) {
      lastError = err;
      const msg = err.message || String(err);
      console.error(`Error with model ${modelName}:`, msg);
      
      // If it's a format error, we don't try other models (it's likely the prompt/input issue)
      if (msg.includes("ERRO_FORMATO")) {
        break;
      }

      // If it's not a 404, we don't try other models (likely a different error like quota or content filter)
      if (!msg.includes("404") && !msg.includes("not found")) {
        break;
      }
    }
  }

  // If we reach here, report final error correctly
  const finalErrorMsg = lastError?.message || String(lastError);
  console.error("Gemini Generation Error:", lastError);

  if (finalErrorMsg.includes("429") || finalErrorMsg.includes("RESOURCE_EXHAUSTED")) {
    throw new Error("COTA_EXCEDIDA: Limite de requisições atingido. Tente novamente em 1 minuto.");
  }
  if (finalErrorMsg.includes("403") || finalErrorMsg.includes("PERMISSION_DENIED")) {
    throw new Error("ERRO_PERMISSAO: Sua chave API não tem permissão para usar este modelo.");
  }
  
  throw new Error(`ERRO_API: ${finalErrorMsg}`);
}
