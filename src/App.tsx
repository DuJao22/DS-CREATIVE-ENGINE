import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { CreativePlayer } from "./components/CreativePlayer";
import { HistoryTab } from "./components/HistoryTab";
import { SceneEditor } from "./components/SceneEditor";
import { NotificationSystem } from "./components/NotificationSystem";
import { DesignBlueprint, DesignMode, VideoFormat } from "./types";
import { generateDesignBlueprint } from "./services/geminiService";
import { Sparkles, Video, Layers, Wand2, Download, Menu, X, Maximize } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [blueprint, setBlueprint] = useState<DesignBlueprint | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingSceneIdx, setEditingSceneIdx] = useState<number | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    // Mobile auto-close sidebar
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const saveToHistory = async (bp: DesignBlueprint) => {
    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bp.id,
          name: bp.scenes[0].text,
          data: bp
        })
      });
    } catch (err) {
      console.error("Failed to save history", err);
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleGenerate = async (script: string, mode: DesignMode, format: VideoFormat, isStoryBatch: boolean) => {
    setIsGenerating(true);
    setError(null);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    
    try {
      const result = await generateDesignBlueprint(script, mode, format, isStoryBatch);
      setBlueprint(result);
      saveToHistory(result);
    } catch (err) {
      console.error(err);
      setError("Erro ao gerar seu criativo. Verifique sua chave de API ou tente um script diferente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-hidden flex-col">
      {/* Mesh Gradient Background Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed top-[20%] right-[10%] w-[300px] h-[300px] bg-orange-500/15 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-4 lg:px-8 py-4 border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 glass rounded-lg"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/5 rounded-xl flex items-center justify-center shadow-lg border border-white/10 overflow-hidden">
            <img src="https://i.postimg.cc/kgmY092W/image-removebg-preview-(20).png" alt="DS Logo" className="w-6 lg:w-8 h-6 lg:h-8 object-contain" />
          </div>
          <span className="text-lg lg:text-xl font-black tracking-tighter uppercase italic">DS CREATIVE ENGINE <span className="hidden sm:inline text-[9px] font-black text-white/40 border border-white/20 px-2 py-0.5 rounded-full ml-1 uppercase not-italic">V2</span></span>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-4">
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-3 py-2 glass rounded-full text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all shadow-lg active:scale-95"
          >
            <Layers className="w-4 h-4" /> <span className="hidden sm:inline">Histórico</span>
          </button>
          {deferredPrompt && (
            <button 
              onClick={handleInstall}
              className="flex items-center gap-2 p-2 lg:px-4 lg:py-2 glass rounded-full text-[10px] font-black uppercase tracking-widest text-orange-400 border-orange-500/30"
            >
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Install</span>
            </button>
          )}
          <button className="hidden sm:flex bg-orange-500 text-white px-5 py-2 rounded-full font-bold text-xs items-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95">
            <span>EXPORT</span>
            <Video className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative z-10 transition-all duration-500">
        {/* Sidebar - Control Panel */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-80 flex-shrink-0 
          border-r border-white/10 backdrop-blur-3xl bg-black/80 lg:bg-black/40
          transition-transform duration-500 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:-ml-80'}
        `}>
          <Sidebar onGenerate={handleGenerate} isGenerating={isGenerating} />
        </aside>

        {/* Main Content - Preview Area */}
        <main className="relative flex-grow flex items-center justify-center p-4 lg:p-12 bg-black/20 overflow-y-auto">
          {/* Overlay to close sidebar on mobile */}
          {isSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" 
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <AnimatePresence mode="wait">
            {!blueprint && !isGenerating ? (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center max-w-2xl gap-8"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-violet-400 rotate-3">
                    <Video className="w-8 h-8" />
                  </div>
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-fuchsia-400 -rotate-3 translate-y-4">
                    <Layers className="w-8 h-8" />
                  </div>
                </div>
                
                <div className="space-y-6 px-4">
                  <div className="space-y-2">
                    <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none italic uppercase">
                      DS Creative Engine
                    </h2>
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 font-serif italic text-2xl lg:text-3xl">
                      A Fábrica de Criativos Virais
                    </p>
                  </div>
                  <div className="h-[1px] w-24 bg-orange-500/30 mx-auto" />
                  <p className="text-white/40 text-sm lg:text-base leading-relaxed max-w-md mx-auto uppercase tracking-widest font-medium">
                    Engine Exclusiva • DS Company Core Technology
                  </p>
                </div>
              </motion.div>
            ) : isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-8"
              >
                <div className="relative">
                  <div className="w-24 lg:w-32 h-24 lg:h-32 rounded-full border-2 border-dashed border-orange-500/20 animate-spin-slow" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Wand2 className="w-8 lg:w-10 h-8 lg:h-10 text-orange-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2 px-4">
                  <h3 className="text-xl lg:text-2xl font-black tracking-tight uppercase tracking-[0.2em] text-orange-400">DS Neural Engine</h3>
                  <p className="text-white/40 text-[9px] uppercase tracking-widest font-black">Processando Sequência por DS Company...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="player"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex items-center justify-center"
              >
                <CreativePlayer 
                  blueprint={blueprint} 
                  onEditScene={(idx) => setEditingSceneIdx(idx)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/20 border border-red-500/50 backdrop-blur-xl rounded-2xl text-red-100 text-xs font-medium z-50">
              {error}
            </div>
          )}
        </main>
      </div>

      {/* Subtle UI Audio Hint (Optional) */}
      <audio id="ui-sound" src="https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3" preload="auto" />

      <AnimatePresence>
        {isHistoryOpen && (
          <HistoryTab 
            onSelect={(bp) => setBlueprint(bp)} 
            onClose={() => setIsHistoryOpen(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingSceneIdx !== null && blueprint && (
          <SceneEditor 
            blueprint={blueprint}
            sceneIndex={editingSceneIdx}
            onUpdate={(bp) => { setBlueprint(bp); saveToHistory(bp); }}
            onClose={() => setEditingSceneIdx(null)}
          />
        )}
      </AnimatePresence>

      {!blueprint && !isGenerating && <NotificationSystem />}
    </div>
  );
}
