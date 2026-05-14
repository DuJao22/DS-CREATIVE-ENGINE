import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SceneRenderer } from "./SceneRenderer";
import { DesignBlueprint } from "../types";
import { Play, Pause, SkipForward, SkipBack, Maximize, Minimize, Settings, Download } from "lucide-react";
import { cn } from "../lib/utils";
import { toPng } from 'html-to-image';
import JSZip from 'jszip';

interface CreativePlayerProps {
  blueprint: DesignBlueprint;
  onFinish?: () => void;
  onEditScene?: (index: number) => void;
}

const playClick = () => {
  const audio = document.getElementById('ui-sound') as HTMLAudioElement;
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
};

export function CreativePlayer({ blueprint, onFinish, onEditScene }: CreativePlayerProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);

  const downloadCurrentScene = async () => {
    if (!playerRef.current) return;
    try {
      const dataUrl = await toPng(playerRef.current, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = `scene-${currentSceneIndex + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const downloadAllScenes = async () => {
    if (!playerRef.current) return;
    const zip = new JSZip();
    const folder = zip.folder("scenes");
    setIsPaused(true);

    try {
      for (let i = 0; i < blueprint.scenes.length; i++) {
        setCurrentSceneIndex(i);
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 800));
        const dataUrl = await toPng(playerRef.current, { quality: 0.95 });
        const base64Data = dataUrl.split(',')[1];
        folder?.file(`scene-${i + 1}.png`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.download = `criativos-${blueprint.id.slice(0, 8)}.zip`;
      link.href = URL.createObjectURL(content);
      link.click();
    } catch (err) {
      console.error('Batch download failed', err);
    }
  };

  // Reset index when blueprint changes to avoid out-of-bounds access
  useEffect(() => {
    setCurrentSceneIndex(0);
    setProgress(0);
    setIsPaused(false);
  }, [blueprint]);

  const currentScene = blueprint.scenes[currentSceneIndex];

  const nextScene = useCallback(() => {
    playClick();
    if (currentSceneIndex < blueprint.scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
      setProgress(0);
      if (blueprint.isStoryBatch) {
        setIsPaused(true);
      }
    } else {
      if (!isFullScreen) {
        // Auto replay or stay on last scene
        setCurrentSceneIndex(0);
        setProgress(0);
        setIsPaused(true);
      }
      else {
        setCurrentSceneIndex(0);
        setProgress(0);
      }
    }
  }, [currentSceneIndex, blueprint.scenes.length, onFinish, isFullScreen, blueprint.isStoryBatch]);

  const prevScene = useCallback(() => {
    playClick();
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(prev => prev - 1);
      setProgress(0);
      if (blueprint.isStoryBatch) setIsPaused(true);
    }
  }, [currentSceneIndex, blueprint.isStoryBatch]);

  useEffect(() => {
    if (isPaused || !currentScene) return;

    const interval = 50; // ms
    const totalDuration = (currentScene.duration || 3) * 1000;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + (interval / totalDuration) * 100;
        if (next >= 100) {
          nextScene();
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentSceneIndex, isPaused, currentScene, nextScene]);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    playClick();
  };

  if (!currentScene) return null;

  const is916 = blueprint.format === '9:16';

  return (
    <div className={cn(
      "flex flex-col items-center gap-6 w-full transition-all duration-500",
      isFullScreen ? "fixed inset-0 z-[100] bg-black p-0" : "max-w-4xl mx-auto"
    )}>
      {/* Viewport Container */}
      <div 
        ref={playerRef}
        className={cn(
          "relative overflow-hidden bg-[#0a0a0a] transition-all duration-700",
          isFullScreen 
            ? "w-full h-full rounded-0 border-0" 
            : is916 
              ? "w-[300px] sm:w-[320px] h-[600px] sm:h-[640px] rounded-[48px] border-[8px] border-[#1a1a1a] shadow-[0_0_80px_rgba(139,92,246,0.15)]" 
              : "aspect-[16/9] w-full rounded-2xl border border-white/10"
        )}
      >
        <AnimatePresence mode="wait">
          <SceneRenderer 
            key={currentScene.id} 
            scene={currentScene} 
            blueprint={blueprint} 
          />
        </AnimatePresence>

        {/* Floating Controls Overlay */}
        <div className={cn(
          "absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4 px-8 z-50 transition-opacity duration-300",
          isFullScreen && !isPaused ? "opacity-0 hover:opacity-100" : "opacity-100"
        )}>
          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
            <motion.div 
              className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6 px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full">
            <button onClick={prevScene} className="text-white/40 hover:text-white transition-colors p-1">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={() => { setIsPaused(!isPaused); playClick(); }} className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all">
              {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
            </button>
            <button onClick={nextScene} className="text-white/40 hover:text-white transition-colors p-1">
              <SkipForward className="w-4 h-4" />
            </button>
            <div className="hidden sm:block w-[1px] h-4 bg-white/10 mx-1" />
            <button onClick={downloadCurrentScene} className="text-white/40 hover:text-white transition-colors p-1" title="Download Atual">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={downloadAllScenes} className="text-orange-500/60 hover:text-orange-500 transition-colors p-1" title="Download Todos (ZIP)">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => onEditScene?.(currentSceneIndex)} className="text-white/40 hover:text-white transition-colors p-1">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={toggleFullScreen} className="text-white/40 hover:text-white transition-colors p-1">
              {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Info Overlay */}
        {!isFullScreen && (
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-50">
            <div className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-bold text-white/40 tracking-widest uppercase">
              {blueprint.format} • {blueprint.mode.replace('_', ' ')}
            </div>
            {blueprint.isStoryBatch && (
              <div className="px-3 py-1 bg-orange-500/80 backdrop-blur-md border border-orange-400/50 rounded-lg text-[9px] font-black text-white tracking-[0.2em] uppercase shadow-lg shadow-orange-500/20">
                Story Batch Mode
              </div>
            )}
          </div>
        )}

        {isFullScreen && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2 border border-white/10 glass rounded-full opacity-30 hover:opacity-100 transition-opacity flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Ready to Record Screen</span>
          </div>
        )}

        {/* Tap to skip (mobile friendly) in Fullscreen */}
        {isFullScreen && (
          <div className="absolute inset-0 z-10 flex">
            <div className="w-1/3 h-full cursor-pointer" onClick={prevScene} />
            <div className="w-1/3 h-full cursor-pointer" onClick={() => setIsPaused(!isPaused)} />
            <div className="w-1/3 h-full cursor-pointer" onClick={nextScene} />
          </div>
        )}
      </div>

      {/* Timeline Nav */}
      {!isFullScreen && (
        <div className="flex gap-2 p-2 glass rounded-2xl overflow-x-auto max-w-full no-scrollbar">
          {blueprint.scenes.map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => {
                playClick();
                setCurrentSceneIndex(idx);
                setProgress(0);
              }}
              className={cn(
                "flex-shrink-0 w-20 sm:w-24 h-12 sm:h-14 rounded-xl border flex flex-col p-2 transition-all",
                currentSceneIndex === idx 
                  ? "border-orange-500 bg-orange-500/10" 
                  : "border-white/5 bg-white/5 grayscale"
              )}
            >
              <span className={cn(
                "text-[8px] uppercase font-bold truncate",
                currentSceneIndex === idx ? "text-orange-500" : "text-white/20"
              )}>{scene.animation}</span>
              <span className="text-[10px] text-white/50 line-clamp-1 mt-auto">{scene.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
