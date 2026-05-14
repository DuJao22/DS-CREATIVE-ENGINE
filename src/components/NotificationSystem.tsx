import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, ExternalLink, X, TrendingUp } from "lucide-react";

const NAMES = ["João", "Maria", "Pedro", "Ana", "Lucas", "Julia", "Marcos", "Beatriz", "Ricardo", "Fernanda", "Gabriel", "Camila", "Rodrigo", "Larissa", "Mateus", "Bruna"];
const CITIES = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre", "Salvador", "Fortaleza", "Brasília", "Recife", "Manaus"];

export function NotificationSystem() {
  const [purchase, setPurchase] = useState<{ name: string; city: string } | null>(null);
  const [showCourse, setShowCourse] = useState(false);

  // Social Proof: every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      setPurchase({ name, city });
      
      // Hide after 3 seconds
      setTimeout(() => setPurchase(null), 3000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Course CTA: Show once after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCourse(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Purchase Notification (Bottom Left) */}
      <div className="fixed bottom-6 left-6 z-20 flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {purchase && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              onClick={() => window.open('https://lp-curso-saas.vercel.app/', '_blank')}
              className="flex items-center gap-3 p-3 glass border-white/10 rounded-2xl shadow-xl bg-black/80 backdrop-blur-xl max-w-[280px] pointer-events-auto cursor-pointer hover:bg-black/90 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/90 uppercase tracking-widest">{purchase.name} adidquiriu o produto</p>
                <p className="text-[9px] text-white/40 uppercase font-bold">Há 2 segundos • {purchase.city}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Course CTA Notification (Centered Bottom) */}
      <AnimatePresence>
        {showCourse && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed inset-x-0 bottom-10 mx-auto flex items-center justify-center p-4 z-20 pointer-events-none"
          >
            <div 
              className="group flex flex-col sm:flex-row items-center gap-5 p-5 glass border-orange-500/30 rounded-[32px] shadow-2xl bg-black/90 backdrop-blur-2xl max-w-lg pointer-events-auto cursor-pointer relative overflow-hidden"
              onClick={() => window.open('https://lp-curso-saas.vercel.app/', '_blank')}
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-50" />
              
              <button 
                onClick={(e) => { e.stopPropagation(); setShowCourse(false); }}
                className="absolute top-3 right-3 p-1.5 hover:bg-white/5 rounded-full transition-colors text-white/20 hover:text-white z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative w-28 h-28 flex-shrink-0">
                <img 
                  src="https://i.postimg.cc/pTcP7VxN/images-2-removebg-preview.png" 
                  alt="Mini SaaS Course" 
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <TrendingUp className="w-3 h-3 text-orange-500" />
                  <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em]">Oportunidade Única</span>
                </div>
                <h4 className="text-lg font-black leading-tight tracking-tight uppercase italic">
                  Crie seu próprio <span className="text-orange-500">Mini SaaS</span> em poucas horas
                </h4>
                <p className="text-[10px] text-white/40 uppercase font-black leading-relaxed tracking-wider">
                  Aprenda na prática a construir e hospedar com banco de dados online <span className="text-white/80">TOTALMENTE GRÁTIS</span>.
                </p>
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full group-hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
                    Começar Agora <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
