import { useState } from "react";
import { DesignBlueprint, Scene } from "../types";
import { Settings, Type, Move, Palette, Trash2, X, Check } from "lucide-react";
import { cn } from "../lib/utils";

interface SceneEditorProps {
  blueprint: DesignBlueprint;
  sceneIndex: number;
  onUpdate: (updatedBlueprint: DesignBlueprint) => void;
  onClose: () => void;
}

export function SceneEditor({ blueprint, sceneIndex, onUpdate, onClose }: SceneEditorProps) {
  const scene = blueprint.scenes[sceneIndex];
  const [text, setText] = useState(scene.text);
  const [subtext, setSubtext] = useState(scene.subtext || "");
  const [fontSize, setFontSize] = useState(scene.fontSize || 64);
  const [fontFamily, setFontFamily] = useState(scene.fontFamily || blueprint.fontFamily);
  const [layoutType, setLayoutType] = useState(scene.layoutType);

  const handleSave = () => {
    const updatedScenes = [...blueprint.scenes];
    updatedScenes[sceneIndex] = {
      ...scene,
      text,
      subtext,
      fontSize,
      fontFamily,
      layoutType
    };
    onUpdate({ ...blueprint, scenes: updatedScenes });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg glass rounded-[32px] overflow-hidden flex flex-col border-white/10 shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-orange-500" />
            <h3 className="font-black uppercase tracking-widest text-[10px]">DS Scene Engine <span className="text-white/20 ml-2">Editor</span></h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] no-scrollbar">
          {/* Text & Subtext */}
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest flex items-center gap-2">
                <Type className="w-3.5 h-3.5" /> Título Principal
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all resize-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest flex items-center gap-2">
                <Type className="w-3.5 h-3.5" opacity={0.5} /> Subtexto / Descrição
              </label>
              <textarea
                value={subtext}
                onChange={(e) => setSubtext(e.target.value)}
                className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all resize-none"
                placeholder="Complemente a mensagem..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Font Size */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Tamanho da Fonte ({fontSize}px)</label>
              <input 
                type="range" 
                min="20" 
                max="120" 
                value={fontSize} 
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full accent-orange-500 bg-white/10 h-1 rounded-full cursor-pointer"
              />
            </div>

            {/* Layout */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Layout da Cena</label>
              <select 
                value={layoutType}
                onChange={(e) => setLayoutType(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs focus:outline-none"
              >
                <optgroup label="Básico">
                  <option value="centered">Centralizado</option>
                  <option value="top">Superior</option>
                  <option value="bottom">Inferior</option>
                  <option value="split">Lateral (Split)</option>
                </optgroup>
                <optgroup label="Pro Landing Page">
                  <option value="hero">Hero Section</option>
                  <option value="bento">Bento Grid</option>
                  <option value="card">3D Floating Card</option>
                  <option value="feature-list">Feature List</option>
                  <option value="gallery">Gallery Grid</option>
                  <option value="timeline">Timeline Journey</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Família da Fonte</label>
            <div className="grid grid-cols-2 gap-2">
              {["Inter", "Outfit", "Playfair Display", "Space Grotesk"].map(f => (
                <button
                  key={f}
                  onClick={() => setFontFamily(f)}
                  className={cn(
                    "px-3 py-2 rounded-xl border text-[10px] font-bold transition-all",
                    fontFamily === f ? "bg-white text-black border-white" : "bg-white/5 text-white/40 border-white/5"
                  )}
                  style={{ fontFamily: f }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 border-t border-white/10 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 font-black uppercase tracking-widest text-[10px] text-white/40 border border-white/5 rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            Descartar
          </button>
          <button 
            onClick={handleSave}
            className="flex-[2] py-4 bg-orange-500 font-black uppercase tracking-widest text-[10px] text-white rounded-2xl hover:bg-orange-600 shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-3.5 h-3.5" /> Aplicar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
