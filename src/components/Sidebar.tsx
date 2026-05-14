import { useState } from "react";
import { DesignMode, VideoFormat } from "../types";
import { Sparkles, Layout, Monitor, Smartphone, Wand2, Trash2, Instagram, User, ExternalLink } from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarProps {
  onGenerate: (script: string, mode: DesignMode, format: VideoFormat, isStoryBatch: boolean) => void;
  isGenerating: boolean;
}

const MODES: { value: DesignMode; label: string; icon: string }[] = [
  { value: "ULTRA_VIRAL", label: "Ultra Viral", icon: "🚀" },
  { value: "MINIMALIST", label: "Minimalista", icon: "✨" },
  { value: "CINEMATIC", label: "Cinemático", icon: "🎬" },
  { value: "DARK_LUXURY", label: "Dark Luxury", icon: "💎" },
  { value: "NEON_TECH", label: "Neon Tech", icon: "🤖" },
];

export function Sidebar({ onGenerate, isGenerating }: SidebarProps) {
  const [script, setScript] = useState("");
  const [mode, setMode] = useState<DesignMode>("CINEMATIC");
  const [format, setFormat] = useState<VideoFormat>("9:16");
  const [isStoryBatch, setIsStoryBatch] = useState(false);

  const handleGenerate = () => {
    const audio = document.getElementById('ui-sound') as HTMLAudioElement;
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
    onGenerate(script, mode, format, isStoryBatch);
  };

  return (
    <div className="flex flex-col h-full p-6 gap-8 overflow-y-auto no-scrollbar">
      {/* Script Input */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between ml-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block">Roteiro do Criativo</label>
          <span className="text-[9px] text-orange-500/60 font-medium animate-pulse uppercase">Modo Inteligente Ativo</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 h-72 relative group hover:border-orange-500/50 transition-colors flex flex-col shadow-inner">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Cole aqui sua explicação, passo-a-passo ou roteiro. A IA manterá sua lógica exata enquando eleva o design ao nível DS Company.&#10;&#10;Ex: Passo 1: Acesse dscompany.com... Passo 2: Clique em Registrar..."
            className="w-full flex-grow bg-transparent border-none outline-none resize-none text-sm leading-relaxed text-white/80 placeholder:text-white/20 scrollbar-thin scrollbar-thumb-white/10"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">{script.length} characters</span>
            <button 
              onClick={() => setScript("")}
              className="text-white/20 hover:text-white/60 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block">Production Mode</label>
          <button 
            onClick={() => setIsStoryBatch(!isStoryBatch)}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all border",
              isStoryBatch ? "bg-orange-500 text-white border-orange-400" : "bg-white/5 text-white/40 border-white/10"
            )}
          >
            <Sparkles className="w-3 h-3" />
            Story Batch
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFormat("9:16")}
            className={cn(
              "border rounded-xl p-3 flex flex-col items-center gap-2 transition-all",
              format === '9:16' 
                ? "bg-white/10 border-white/20 text-white" 
                : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10"
            )}
          >
            <div className={cn("w-3 h-5 border-2 rounded-sm", format === '9:16' ? "border-white" : "border-white/20")}></div>
            <span className="text-[9px] font-bold">9:16 STORY</span>
          </button>
          <button
            onClick={() => setFormat("16:9")}
            className={cn(
              "border rounded-xl p-3 flex flex-col items-center gap-2 transition-all",
              format === '16:9' 
                ? "bg-white/10 border-white/20 text-white" 
                : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10"
            )}
          >
            <div className={cn("w-5 h-3 border-2 rounded-sm", format === '16:9' ? "border-white" : "border-white/20")}></div>
            <span className="text-[9px] font-bold">16:9 ADS</span>
          </button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex flex-col gap-3">
        <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block ml-1">Visual Persona</label>
        <div className="space-y-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={cn(
                "w-full p-3 rounded-2xl border flex items-center justify-between group transition-all",
                mode === m.value 
                  ? "bg-gradient-to-r from-orange-600/20 to-orange-900/10 border-orange-500/40 text-white" 
                  : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn("text-base transition-all", mode !== m.value && "grayscale group-hover:grayscale-0")}>{m.icon}</span>
                <span className="text-sm font-bold">{m.label}</span>
              </div>
              <div className={cn(
                "w-4 h-4 rounded-full border-4 transition-all",
                mode === m.value ? "border-orange-500 bg-black" : "border-white/10 bg-transparent"
              )}></div>
            </button>
          ))}
        </div>
      </div>

      <button
        disabled={isGenerating || !script.trim()}
        onClick={handleGenerate}
        className={cn(
          "mt-4 w-full py-5 rounded-2xl bg-orange-500 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all hover:bg-orange-600 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/40 active:scale-[0.98] disabled:opacity-30 disabled:grayscale",
          isGenerating && "animate-pulse"
        )}
      >
        <Wand2 className={cn("w-4 h-4", isGenerating && "animate-spin")} />
        {isGenerating ? "Engenharia Neural..." : "Criar Engine"}
      </button>

      <div className="flex flex-col gap-4 mt-4">
        <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block ml-1 text-center">Créditos de Criação</label>
        
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-0.5">João Layon</p>
                <p className="text-[9px] text-white/40 uppercase font-medium">CEO • Fullstack Developer</p>
              </div>
              <a href="https://instagram.com/layon.dev" target="_blank" rel="noopener noreferrer" className="p-2 glass rounded-full hover:text-orange-500 transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-0.5">Paulo Davi</p>
                <p className="text-[9px] text-white/40 uppercase font-medium">CEO DS Company</p>
              </div>
              <a href="https://instagram.com/davi._link" target="_blank" rel="noopener noreferrer" className="p-2 glass rounded-full hover:text-orange-500 transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <a 
          href="https://instagram.com/dscompany1_" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-4 glass rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-orange-500/10 transition-all border-white/5"
        >
          <Instagram className="w-4 h-4" /> @dscompany1_
        </a>
      </div>

      <div className="p-4 bg-gradient-to-br from-orange-900/20 to-black border border-orange-500/30 rounded-2xl text-center">
        <p className="text-[9px] text-orange-400 font-black uppercase tracking-[0.2em] mb-1">DS COMPANY INTELLIGENCE</p>
        <p className="text-[8px] text-white/20 uppercase font-bold">Neural Core v2.4.0 active</p>
      </div>
    </div>
  );
}
