export type VideoFormat = '9:16' | '16:9';

export type AnimationType = 
  | 'fade' 
  | 'zoom' 
  | 'typewriter' 
  | 'slide-up' 
  | 'glitch' 
  | 'blur-reveal' 
  | 'stagger';

export type DesignMode = 
  | 'ULTRA_VIRAL' 
  | 'MINIMALIST' 
  | 'CINEMATIC' 
  | 'DARK_LUXURY' 
  | 'NEON_TECH';

export interface Scene {
  id: string;
  text: string;
  highlightWords: string[];
  backgroundEmoji?: string;
  backgroundImage?: string;
  animation: AnimationType;
  duration: number; // in seconds
  layoutType: 'centered' | 'top' | 'bottom' | 'split';
  impact: 'low' | 'medium' | 'high';
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

export interface DesignBlueprint {
  id: string;
  name?: string;
  mode: DesignMode;
  format: VideoFormat;
  scenes: Scene[];
  isStoryBatch?: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  fontFamily: string;
  soundHint?: string;
}
