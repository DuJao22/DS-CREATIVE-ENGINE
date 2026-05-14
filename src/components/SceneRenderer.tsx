import { motion, AnimatePresence } from "motion/react";
import { Scene, DesignBlueprint } from "../types";
import { cn } from "../lib/utils";

interface SceneRendererProps {
  scene: Scene;
  blueprint: DesignBlueprint;
  isPaused?: boolean;
}

export function SceneRenderer({ scene, blueprint, isPaused }: SceneRendererProps) {
  const { colors, mode, fontFamily } = blueprint;

  const renderText = () => {
    const words = scene.text.split(" ");
    return words.map((word, i) => {
      const isHighlighted = scene.highlightWords.some(h => 
        word.toLowerCase().includes(h.toLowerCase())
      );

      return (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className={cn(
            "inline-block mr-2 md:mr-4",
            isHighlighted && "text-accent font-bold scale-110 glow-text"
          )}
          style={{ color: isHighlighted ? colors.accent : colors.primary }}
        >
          {word}
        </motion.span>
      );
    });
  };

  const getAnimationProps = () => {
    switch (scene.animation) {
      case 'zoom':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 1.2, opacity: 0 },
          transition: { duration: 0.8, ease: "easeOut" }
        };
      case 'glitch':
        return {
          initial: { x: -10, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: 10, opacity: 0 },
          transition: { 
            type: "spring", 
            stiffness: 500, 
            damping: 30 
          }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.6 }
        };
    }
  };

  const animationProps = getAnimationProps() as any;

  const layoutStyles = {
    centered: "justify-center items-center text-center",
    top: "justify-start items-center text-center pt-20",
    bottom: "justify-end items-center text-center pb-20",
    split: "justify-center items-start text-left px-12"
  }[scene.layoutType];

  return (
    <motion.div
      {...animationProps}
      className={cn(
        "relative w-full h-full flex flex-col overflow-hidden bg-[#0A0A0A]",
        layoutStyles
      )}
      style={{ 
        backgroundColor: colors.background || "#0A0A0A", 
        fontFamily: scene.fontFamily || fontFamily 
      }}
    >
      {/* Dynamic Background Elements */}
      {mode === 'NEON_TECH' && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
      )}

      {scene.backgroundEmoji && (
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute text-8xl md:text-9xl opacity-20 filter blur-sm grayscale"
        >
          {scene.backgroundEmoji}
        </motion.div>
      )}

      <div className="relative z-10 max-w-[90%]">
        <h2 
          className={cn(
            "text-4xl md:text-6xl font-black tracking-tight leading-tight",
            scene.impact === 'high' && "uppercase"
          )}
          style={{ fontSize: scene.fontSize ? `${scene.fontSize}px` : undefined }}
        >
          {renderText()}
        </h2>
      </div>

      {/* Mode Specific Effects */}
      {mode === 'DARK_LUXURY' && (
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/60 pointer-events-none" />
      )}
    </motion.div>
  );
}
