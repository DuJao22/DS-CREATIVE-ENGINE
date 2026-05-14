import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, CheckCircle2, AlertCircle, ExternalLink, Settings } from 'lucide-react';
import { verifyApiKey } from '../services/geminiService';

interface SettingsModalProps {
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

export function SettingsModal({ onClose, onSave, currentKey }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(currentKey);
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleVerify = async () => {
    if (!apiKey) return;
    setIsVerifying(true);
    setStatus('idle');
    const isValid = await verifyApiKey(apiKey);
    setStatus(isValid ? 'success' : 'error');
    if (isValid) {
      onSave(apiKey);
    }
    setIsVerifying(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md glass border-white/10 rounded-3xl p-8 bg-black/90 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Configurações</h2>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">DS neural interface v1.0</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-white/40 flex items-center justify-between">
              Gemini API Key
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-orange-500 hover:underline flex items-center gap-1"
              >
                Pegar Chave <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Insira sua chave aqui..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-all font-mono"
              />
              <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            </div>
          </div>

          <button 
            onClick={handleVerify}
            disabled={isVerifying || !apiKey}
            className={`
              w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all
              ${status === 'success' ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 
                status === 'error' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                'bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-500/20'}
              disabled:opacity-50
            `}
          >
            {isVerifying ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : status === 'success' ? (
              <><CheckCircle2 className="w-4 h-4" /> Chave Válida!</>
            ) : status === 'error' ? (
              <><AlertCircle className="w-4 h-4" /> Chave Inválida</>
            ) : (
              'Verificar e Salvar'
            )}
          </button>

          <p className="text-[9px] text-white/30 text-center leading-relaxed">
            Sua chave é salva apenas localmente no seu navegador.<br/>
            A DS Company não tem acesso à sua chave.
          </p>

          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-500/80">Tutorial: Nova Chave</h4>
            <div className="space-y-2">
              <div className="flex gap-3 text-[10px] text-white/40">
                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white">1</span>
                <span>Clique em "Pegar Chave" acima para abrir o Google AI Studio.</span>
              </div>
              <div className="flex gap-3 text-[10px] text-white/40">
                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white">2</span>
                <span>Clique em "Create API key" e depois em "Create API key in new project".</span>
              </div>
              <div className="flex gap-3 text-[10px] text-white/40">
                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white">3</span>
                <span>Copie a chave gerada e cole no campo acima.</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
