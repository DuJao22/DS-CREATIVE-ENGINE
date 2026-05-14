import { motion, AnimatePresence } from "motion/react";
import { Scene, DesignBlueprint } from "../types";
import { cn } from "../lib/utils";
import { ArrowRight, Star, Shield, Zap, Target, TrendingUp, Sparkles } from "lucide-react";

interface SceneRendererProps {
  scene: Scene;
  blueprint: DesignBlueprint;
  isPaused?: boolean;
}

const IconMap: Record<string, any> = {
  Zap, Star, Shield, Target, TrendingUp, Sparkles
};

export function SceneRenderer({ scene, blueprint, isPaused }: SceneRendererProps) {
  const { colors, mode, fontFamily } = blueprint;

  const renderText = (text: string, isHeadline: boolean = true) => {
    const words = text.split(" ");
    return words.map((word, i) => {
      const isHighlighted = scene.highlightWords.some(h => 
        word.toLowerCase().includes(h.toLowerCase())
      );

      return (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ 
            delay: i * 0.08 + (isHeadline ? 0.2 : 0.5), 
            duration: 0.6,
            ease: [0.21, 0.47, 0.32, 0.98] 
          }}
          className={cn(
            "inline-block mr-[0.2em]",
            isHeadline ? "font-black tracking-tighter" : "font-medium opacity-80",
            isHighlighted && isHeadline && "text-accent relative"
          )}
          style={{ 
            color: isHighlighted && isHeadline ? colors.accent : (isHeadline ? colors.primary : colors.secondary),
          }}
        >
          {word}
          {isHighlighted && isHeadline && (
            <motion.span 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.08 + 0.6, duration: 0.8 }}
              className="absolute -bottom-1 left-0 w-full h-[0.1em] origin-left rounded-full opacity-50"
              style={{ backgroundColor: colors.accent }}
            />
          )}
        </motion.span>
      );
    });
  };

  const LayoutContent = () => {
    switch (scene.layoutType) {
      case 'hero':
        return (
          <div className="flex flex-col items-center text-center max-w-2xl px-6 gap-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="px-4 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-black tracking-[0.2em] uppercase text-white/40"
            >
              Exclusivo • 2024
            </motion.div>
            <h1 className="text-5xl md:text-7xl leading-[0.95]">{renderText(scene.text)}</h1>
            {scene.subtext && (
              <p className="text-base md:text-lg max-w-lg leading-relaxed">{renderText(scene.subtext, false)}</p>
            )}
            {scene.ctaText && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-4 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-2xl transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: colors.accent, color: colors.background }}
              >
                {scene.ctaText} <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        );

      case 'bento':
        return (
          <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full h-full max-w-4xl p-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} 
              className="col-span-2 row-span-1 glass border-white/5 p-8 flex flex-col justify-center gap-2"
            >
              <h2 className="text-3xl font-black italic tracking-tighter">{renderText(scene.text)}</h2>
              {scene.subtext && <p className="text-sm opacity-60 font-medium">{scene.subtext}</p>}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="col-span-1 glass border-white/5 p-6 flex items-center justify-center bg-accent/10"
            >
              <Zap className="w-12 h-12 text-accent" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
              className="col-span-1 glass border-white/5 p-6 flex flex-col justify-center text-center"
            >
              <div className="text-2xl font-black text-accent">+99%</div>
              <div className="text-[10px] uppercase font-bold opacity-40">Performance</div>
            </motion.div>
          </div>
        );

      case 'card':
        return (
          <div className="flex flex-col items-center justify-center gap-8 w-full p-6">
            <motion.div
              initial={{ y: 40, opacity: 0, rotateX: 20 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="w-full max-w-md glass border-white/10 p-10 rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-gradient-to-br from-white/10 to-transparent"
            >
              <Sparkles className="w-10 h-10 text-accent mb-6" />
              <h2 className="text-4xl font-black leading-tight mb-4">{renderText(scene.text)}</h2>
              {scene.subtext && <p className="text-base opacity-70 leading-relaxed font-medium">{scene.subtext}</p>}
            </motion.div>
          </div>
        );

      case 'feature-list':
        return (
          <div className="flex flex-col md:flex-row items-center gap-12 w-full max-w-5xl px-12">
            <div className="flex-1 space-y-4">
              <h2 className="text-5xl font-black leading-[0.9] italic tracking-tight">{renderText(scene.text)}</h2>
              <p className="text-lg opacity-60 font-medium">{scene.subtext}</p>
            </div>
            <div className="flex-1 grid gap-4">
              {[Zap, Shield, Target].map((Icon, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.15 }}
                  className="flex items-center gap-5 p-4 rounded-2xl glass border-white/5 hover:border-white/20 transition-all group"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-black uppercase tracking-widest text-[10px]">Benefício 0{i+1}</div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="flex flex-col items-center gap-12 w-full max-w-6xl px-12">
            <div className="text-center space-y-4">
               <h2 className="text-5xl font-black italic tracking-tighter">{renderText(scene.text)}</h2>
               {scene.subtext && <p className="text-base opacity-60 font-medium max-w-2xl">{scene.subtext}</p>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
              {[1, 2, 3].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.2 }}
                  className="aspect-[4/5] rounded-[32px] glass border-white/10 relative overflow-hidden group shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-700">
                    {scene.backgroundEmoji || '📸'}
                  </div>
                  <div className="absolute bottom-6 left-6 z-20">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Preview 0{i+1}</div>
                    <div className="font-bold text-sm">Visual Asset</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="flex flex-col md:flex-row items-center gap-16 w-full max-w-5xl px-12">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-6xl font-black leading-tight italic tracking-tighter mb-4">{renderText(scene.text)}</h2>
              <p className="text-lg opacity-60 font-medium">{scene.subtext}</p>
            </div>
            <div className="flex-1 relative">
              <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-white/5" />
              <div className="space-y-12">
                {[1, 2, 3].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.2 }}
                    className="flex gap-6 relative"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-accent bg-black flex items-center justify-center font-black text-accent text-sm z-10 shrink-0">
                      {i + 1}
                    </div>
                    <div className="pt-2">
                      <div className="font-black uppercase tracking-widest text-[10px] text-accent mb-1">Passo {i + 1}</div>
                      <div className="text-sm font-bold opacity-80 leading-snug">Execução estratégica em tempo real</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center text-center max-w-3xl px-8 gap-4">
             <h2 className="text-4xl md:text-6xl">{renderText(scene.text)}</h2>
             {scene.subtext && <p className="text-sm md:text-lg opacity-60">{renderText(scene.subtext, false)}</p>}
          </div>
        );
    }
  };

  const layoutClasses = {
    centered: "justify-center items-center",
    top: "justify-start pt-[15%] items-center",
    bottom: "justify-end pb-[15%] items-center",
    split: "justify-center items-start text-left px-12",
    bento: "justify-center items-center",
    hero: "justify-center items-center",
    card: "justify-center items-center",
    'feature-list': "justify-center items-center"
  }[scene.layoutType];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "relative w-full h-full flex flex-col overflow-hidden perspective-1000",
        layoutClasses
      )}
      style={{ 
        backgroundColor: colors.background, 
        fontFamily: scene.fontFamily || fontFamily 
      }}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full" />
        {mode === 'NEON_TECH' && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />}
      </div>

      {scene.backgroundEmoji && (
        <motion.div
          animate={{ 
            y: [-20, 20], 
            rotate: [-5, 5],
            scale: [1, 1.05, 1]
          }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", repeatType: "reverse" }}
          className="absolute text-[200px] md:text-[300px] opacity-10 filter blur-[2px] -z-0 grayscale"
        >
          {scene.backgroundEmoji}
        </motion.div>
      )}

      <div className="relative z-10 w-full flex items-center justify-center">
        <LayoutContent />
      </div>

      {/* Mode Finishes */}
      {mode === 'DARK_LUXURY' && <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />}
      {mode === 'ULTRA_VIRAL' && <div className="absolute inset-0 border-[32px] border-accent/20 pointer-events-none" />}
    </motion.div>
  );
}

