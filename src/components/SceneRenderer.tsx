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
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ 
            delay: i * 0.06 + (isHeadline ? 0.2 : 0.4), 
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1] 
          }}
          className={cn(
            "inline-block mr-[0.25em] transition-colors duration-500",
            isHeadline ? "font-black tracking-tight leading-[1.1]" : "font-medium opacity-70 leading-relaxed",
            isHighlighted && isHeadline && "text-accent relative z-10"
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
              transition={{ delay: i * 0.08 + 0.6, duration: 1, ease: "circOut" }}
              className="absolute -bottom-1 left-0 w-full h-[0.15em] origin-left rounded-full opacity-30 -z-10"
              style={{ backgroundColor: colors.accent }}
            />
          )}
        </motion.span>
      );
    });
  };

  const renderLayout = () => {
    switch (scene.layoutType) {
      case 'hero':
        return (
          <div className="flex flex-col items-center text-center max-w-full px-4 gap-4 transform-style-3d">
            <motion.div
              initial={{ opacity: 0, y: -20, rotateX: -20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.1, duration: 1 }}
              className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[8px] font-black tracking-[0.3em] uppercase text-white/50 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
            >
              DS CREATIVE • GEN
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, z: 100, rotateX: 20 }}
              animate={{ opacity: 1, z: 0, rotateX: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl sm:text-3xl font-black drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] uppercase italic tracking-tighter"
            >
              {renderText(scene.text)}
            </motion.h1>
            {scene.subtext && (
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-[10px] sm:text-xs px-4 opacity-70 font-medium leading-tight mb-2"
              >
                {renderText(scene.subtext, false)}
              </motion.p>
            )}
            {scene.ctaText && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, z: -50 }}
                animate={{ opacity: 1, scale: 1, z: 0 }}
                transition={{ delay: 1.2, type: "spring" }}
                className="mt-2 px-6 py-3 rounded-full font-black uppercase tracking-[0.2em] text-[8px] flex items-center gap-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] bg-gradient-to-r from-accent to-accent/80 hover:brightness-110 active:scale-95 transition-all preserve-3d"
                style={{ backgroundColor: colors.accent, color: colors.background }}
              >
                <span className="translate-z-10">{scene.ctaText}</span> <ArrowRight className="w-3 h-3 translate-z-10" />
              </motion.button>
            )}
          </div>
        );

      case 'bento':
        return (
          <div className="grid grid-cols-2 gap-3 w-full h-full p-4 perspective-1000 transform-style-3d">
            <motion.div 
              initial={{ opacity: 0, rotateY: -15, z: -50 }} 
              animate={{ opacity: 1, rotateY: 0, z: 0 }} 
              transition={{ duration: 1 }}
              className="col-span-2 row-span-1 rounded-[24px] glass border-white/5 p-6 flex flex-col justify-center gap-2 overflow-hidden group shadow-2xl relative"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity translate-z-20">
                <Sparkles className="w-12 h-12" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tighter leading-none relative z-10 translate-z-10 uppercase italic">{renderText(scene.text)}</h2>
              {scene.subtext && <p className="text-[9px] opacity-50 font-black uppercase tracking-widest relative z-10 translate-z-5">{scene.subtext}</p>}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -50, rotateY: 30 }} 
              animate={{ opacity: 1, x: 0, rotateY: 0 }} 
              transition={{ delay: 0.4, duration: 0.8 }}
              className="col-span-1 glass border-white/5 p-4 rounded-[16px] flex items-center justify-center bg-accent/5 shadow-xl"
            >
              <div className="relative translate-z-30">
                <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full" />
                <Zap className="w-8 h-8 text-accent relative z-10" />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50, rotateY: -30 }} 
              animate={{ opacity: 1, x: 0, rotateY: 0 }} 
              transition={{ delay: 0.6, duration: 0.8 }}
              className="col-span-1 glass border-white/5 p-4 rounded-[16px] flex flex-col justify-center text-center gap-1 shadow-xl"
            >
              <div className="text-sm font-black text-accent tracking-tighter italic translate-z-20 uppercase">Top Phase</div>
              <div className="text-[8px] uppercase font-black opacity-30 tracking-[0.2em] translate-z-10">Process Start</div>
            </motion.div>
          </div>
        );

      case 'card':
        return (
          <div className="flex flex-col items-center justify-center gap-6 w-full p-6 perspective-2000 transform-style-3d">
            <motion.div
              initial={{ y: 100, opacity: 0, rotateX: 45, rotateY: 15, z: -200 }}
              animate={{ y: 0, opacity: 1, rotateX: 0, rotateY: 0, z: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 80, delay: 0.2 }}
              whileHover={{ rotateY: 10, rotateX: -5, z: 50 }}
              className="w-full max-w-[280px] sm:max-w-sm glass border-white/20 p-6 sm:p-10 rounded-[24px] sm:rounded-[40px] shadow-[0_50px_100px_-25px_rgba(0,0,0,0.8)] relative group overflow-hidden transform-style-3d"
            >
               <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/10 blur-[50px] rounded-full group-hover:bg-accent/20 transition-colors translate-z-[-20px]" />
               <motion.div
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ delay: 0.8, type: "spring" }}
                 className="translate-z-50 mb-6"
               >
                 <Sparkles className="w-8 h-8 text-accent" />
               </motion.div>
               <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-4 translate-z-40 drop-shadow-lg uppercase italic">{renderText(scene.text)}</h2>
               {scene.subtext && <p className="text-[10px] sm:text-xs opacity-60 leading-relaxed font-bold translate-z-20 uppercase">{scene.subtext}</p>}
            </motion.div>
          </div>
        );

      case 'feature-list':
        return (
          <div className="flex flex-col items-center justify-center gap-8 w-full max-w-sm px-4 transform-style-3d pt-12">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="space-y-4 text-center drop-shadow-2xl"
            >
              <h2 className="text-3xl sm:text-4xl font-black leading-none italic tracking-tighter uppercase">{renderText(scene.text)}</h2>
              <p className="text-[10px] opacity-50 font-black uppercase tracking-widest">{scene.subtext}</p>
            </motion.div>
            <div className="w-full space-y-3 transform-style-3d">
              {(scene.listItems || [
                { title: "Standard Quality", id: "1" },
                { title: "Standard Quality", id: "2" },
                { title: "Standard Quality", id: "3" }
              ]).map((item, i) => {
                const Icon = IconMap[item.icon || "Zap"] || Zap;
                return (
                  <motion.div
                    key={item.id || i}
                    initial={{ x: 50, opacity: 0, z: -50 }}
                    animate={{ x: 0, opacity: 1, z: 0 }}
                    transition={{ delay: 0.8 + i * 0.15, ease: "circOut", duration: 0.8 }}
                    className="flex items-center gap-4 p-4 rounded-[16px] glass border-white/5 hover:border-accent/40 bg-white/5 transition-all group overflow-hidden relative shadow-xl transform-style-3d text-left"
                  >
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform translate-z-20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="relative z-10 translate-z-10">
                      <div className="font-black text-xs italic tracking-tight uppercase">{item.title}</div>
                      {item.description && <div className="text-[8px] opacity-40 font-bold uppercase truncate max-w-[150px]">{item.description}</div>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="flex flex-col items-center gap-8 md:gap-16 w-full max-w-6xl px-4 md:px-12 overflow-hidden transform-style-3d">
            <div className="text-center space-y-3 md:space-y-6 px-4 translate-z-50">
               <h2 className="text-3xl sm:text-4xl md:text-7xl font-black italic tracking-tighter leading-none drop-shadow-2xl">{renderText(scene.text)}</h2>
               {scene.subtext && <p className="text-[10px] sm:text-xs md:text-lg opacity-50 font-black uppercase tracking-[0.3em] max-w-2xl">{scene.subtext}</p>}
            </div>
            <div className="flex md:grid grid-cols-3 gap-4 md:gap-8 w-full overflow-x-auto no-scrollbar pb-8 px-4 flex-nowrap md:flex-wrap items-center justify-center transform-style-3d">
              {[1, 2, 3].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 100, rotateX: 20, z: -100 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, z: 0 }}
                  transition={{ delay: 0.6 + i * 0.2, type: "spring", damping: 15 }}
                  whileHover={{ y: -20, rotateY: 5, z: 40 }}
                  className="min-w-[75vw] md:min-w-0 aspect-[4/5] rounded-[24px] md:rounded-[50px] glass border-white/10 relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] flex-shrink-0 transform-style-3d"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-90" />
                  <div className="absolute inset-0 flex items-center justify-center text-7xl md:text-9xl group-hover:scale-110 transition-transform duration-1000 ease-out grayscale group-hover:grayscale-0 translate-z-10">
                    {scene.backgroundEmoji || '📸'}
                  </div>
                  <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 z-20 translate-z-30">
                    <div className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-2">Collection 2024</div>
                    <div className="font-black text-sm md:text-3xl italic tracking-tighter leading-tight">Iconic Visuals</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-5xl px-4 transform-style-3d overflow-y-auto no-scrollbar py-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, z: -50 }}
              animate={{ opacity: 1, scale: 1, z: 0 }}
              transition={{ duration: 1 }}
              className="text-center space-y-2 translate-z-40"
            >
              <h2 className="text-2xl sm:text-3xl font-black leading-none italic tracking-tighter drop-shadow-2xl uppercase">{renderText(scene.text)}</h2>
              <p className="text-[10px] sm:text-xs opacity-50 font-bold max-w-xs mx-auto leading-tight uppercase">{scene.subtext}</p>
            </motion.div>
            <div className="relative w-full transform-style-3d">
              <div className="absolute left-[19px] top-4 bottom-4 w-[1px] bg-white/10" />
              <div className="space-y-6 transform-style-3d text-left">
                {(scene.listItems || [
                  { title: "Strategic Step", id: "1" },
                  { title: "Strategic Step", id: "2" },
                  { title: "Strategic Step", id: "3" }
                ]).map((item, i) => (
                  <motion.div
                    key={item.id || i}
                    initial={{ x: 50, opacity: 0, rotateY: -20 }}
                    animate={{ x: 0, opacity: 1, rotateY: 0 }}
                    transition={{ delay: 0.8 + i * 0.2, ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
                    className="flex gap-4 relative group transform-style-3d"
                  >
                    <div className="w-10 h-10 rounded-2xl border border-accent bg-background shadow-lg flex items-center justify-center font-black text-accent text-xs z-20 shrink-0 group-hover:bg-accent group-hover:text-background transition-all duration-500 translate-z-20">
                      {i + 1}
                    </div>
                    <div className="pt-1 translate-z-10">
                      <div className="font-black uppercase tracking-[0.25em] text-[7px] text-accent/60 mb-1">Tópico 0{i+1}</div>
                      <div className="text-xs sm:text-sm font-black italic opacity-90 leading-tight tracking-tight uppercase">{item.title}</div>
                      {item.description && <p className="text-[9px] mt-1 opacity-50 font-bold leading-tight line-clamp-4">{item.description}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'split':
        return (
          <div className="flex flex-col md:grid grid-cols-2 w-full h-full transform-style-3d">
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              className="flex flex-col justify-center p-8 md:p-20 text-left gap-6 border-b md:border-b-0 md:border-r border-white/5 bg-black/20"
            >
               <h2 className="text-4xl sm:text-5xl md:text-8xl font-black italic tracking-tighter leading-[0.85] drop-shadow-2xl">{renderText(scene.text)}</h2>
               <p className="text-sm sm:text-base md:text-xl font-bold opacity-50 leading-relaxed max-w-sm">{scene.subtext}</p>
            </motion.div>
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex items-center justify-center p-10 relative overflow-hidden bg-white/[0.01] transform-style-3d"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-accent/5 blur-[120px] rounded-full" />
              <motion.div 
                animate={{ rotate: [12, -12], scale: [1, 1.1, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="text-[180px] md:text-[350px] grayscale opacity-10 drop-shadow-[0_50px_100px_rgba(0,0,0,0.5)] hover:grayscale-0 transition-all duration-1000 translate-z-50"
              >
                {scene.backgroundEmoji || '✨'}
              </motion.div>
            </motion.div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center text-center max-w-4xl px-8 md:px-12 gap-6">
             <h2 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">{renderText(scene.text)}</h2>
             {scene.subtext && <p className="text-sm sm:text-base md:text-xl opacity-60 font-medium leading-relaxed max-w-2xl">{renderText(scene.subtext, false)}</p>}
          </div>
        );
    }
  };

  const layoutClasses = {
    centered: "justify-center items-center text-center",
    top: "justify-start pt-[20%] md:pt-[10%] items-center text-center",
    bottom: "justify-end pb-[20%] md:pb-[10%] items-center text-center",
    split: "justify-center items-stretch",
    bento: "justify-center items-center",
    hero: "justify-center items-center",
    card: "justify-center items-center",
    'feature-list': "justify-center items-center",
    gallery: "justify-center items-center",
    timeline: "justify-center items-center"
  }[scene.layoutType];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "relative w-full h-full flex flex-col overflow-hidden transform-style-3d",
        layoutClasses
      )}
      style={{ 
        backgroundColor: colors.background, 
        fontFamily: scene.fontFamily || fontFamily,
        perspective: "2000px"
      }}
    >
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
        {/* Fine Grain Texture */}
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Dynamic Light Leaks */}
        <motion.div 
          animate={{ 
            opacity: [0.05, 0.15, 0.05],
            x: ["-20%", "20%", "-20%"],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-radial from-accent/10 via-transparent to-transparent blur-[120px]"
        />

        {/* Global Vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
      </div>

      {/* Abstract Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-accent/20 blur-[180px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-primary/10 blur-[200px] rounded-full" 
        />
        {mode === 'NEON_TECH' && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
        )}
      </div>

      {scene.backgroundEmoji && (
        <motion.div
          animate={{ 
            y: [-20, 20], 
            rotate: [-5, 5],
            scale: [1, 1.1, 1]
          }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", repeatType: "reverse" }}
          className="absolute text-[200px] md:text-[350px] opacity-[0.08] filter blur-[4px] -z-0 grayscale flex items-center justify-center inset-0"
        >
          {scene.backgroundEmoji}
        </motion.div>
      )}

      <div className="relative z-10 w-full h-full flex items-center justify-center transform-style-3d">
        {renderLayout()}
      </div>

      {/* Finishing Frame */}
      <div className="absolute inset-4 sm:inset-6 border border-white/5 rounded-[40px] md:rounded-[60px] pointer-events-none z-[110] shadow-[inset_0_0_30px_rgba(255,255,255,0.01)]" />
    </motion.div>
  );
}

