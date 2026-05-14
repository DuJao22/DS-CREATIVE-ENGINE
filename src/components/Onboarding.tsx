import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MousePointer2, ArrowRight, Settings, Key, Zap } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Boas-vindas ao Engine",
      desc: "Vamos configurar sua conta para você começar a criar criativos de alta conversão agora mesmo.",
      icon: <Zap className="w-8 h-8 text-orange-500" />
    },
    {
      title: "Configuração Vital",
      desc: "Para que nossa Inteligência Artificial funcione, você precisa conectar sua própria chave do Google Gemini.",
      icon: <Key className="w-8 h-8 text-violet-500" />
    },
    {
      title: "Como Configurar?",
      desc: "Clique no ícone de engrenagem no topo superior direito e cole sua chave API gratuita do Google.",
      icon: <Settings className="w-8 h-8 text-blue-500" />
    }
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full max-w-sm glass border-white/10 rounded-[32px] p-8 bg-black/90 shadow-2xl relative flex flex-col items-center text-center gap-6"
      >
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-2">
          {steps[step].icon}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">{steps[step].title}</h2>
          <p className="text-white/40 text-sm leading-relaxed">{steps[step].desc}</p>
        </div>

        <div className="flex gap-2 mb-4">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-orange-500' : 'w-2 bg-white/10'}`} 
            />
          ))}
        </div>

        <button 
          onClick={nextStep}
          className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-orange-500 transition-colors group"
        >
          {step === steps.length - 1 ? 'ENTENDI, VAMOS LÁ' : 'PRÓXIMO PASSO'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-[-80px] right-[-40px] pointer-events-none hidden lg:block"
          >
            <div className="flex flex-col items-center">
              <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full mb-2 uppercase italic shadow-lg">Clique Aqui!</span>
              <div className="w-[2px] h-10 bg-gradient-to-b from-orange-500 to-transparent" />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
