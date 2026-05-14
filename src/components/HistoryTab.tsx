import { useEffect, useState } from "react";
import { DesignBlueprint } from "../types";
import { History as HistoryIcon, Clock, Trash2, Video, ChevronRight, X } from "lucide-react";
import { cn } from "../lib/utils";

interface HistoryTabProps {
  onSelect: (blueprint: DesignBlueprint) => void;
  onClose: () => void;
}

export function HistoryTab({ onSelect, onClose }: HistoryTabProps) {
  const [history, setHistory] = useState<{id: string, name: string, data: DesignBlueprint, createdAt: string}[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    let combinedHistory: any[] = [];
    
    // 1. Get from LocalStorage first (instant)
    try {
      const local = JSON.parse(localStorage.getItem('creatives_history') || '[]');
      combinedHistory = local.map((bp: DesignBlueprint) => ({
        id: bp.id,
        name: bp.scenes[0].text,
        data: bp,
        createdAt: new Date().toISOString(), // approximation
        isLocal: true
      }));
      setHistory(combinedHistory);
    } catch (e) {
      console.warn("Local fetch failed", e);
    }

    // 2. Get from DB and merge
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const dbData = await res.json();
        // Simple merge: keep DB as source of truth if IDs match
        const dbIds = new Set(dbData.map((h: any) => h.id));
        const filteredLocal = combinedHistory.filter(h => !dbIds.has(h.id));
        setHistory([...dbData, ...filteredLocal]);
      }
    } catch (err) {
      console.warn("API history fetch failed (Vercel/Offline mode)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const deleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 1. Delete from LocalStorage
    try {
      const local = JSON.parse(localStorage.getItem('creatives_history') || '[]');
      const filtered = local.filter((h: DesignBlueprint) => h.id !== id);
      localStorage.setItem('creatives_history', JSON.stringify(filtered));
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (e) {
      console.warn("Local delete failed", e);
    }

    // 2. Delete from DB
    try {
      await fetch(`/api/history/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("API delete failed (Vercel mode)");
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[120] w-[400px] glass border-l border-white/10 shadow-2xl flex flex-col">
      <div className="p-8 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HistoryIcon className="text-orange-500 w-5 h-5" />
          <h2 className="text-xl font-black tracking-tight">Histórico</h2>
        </div>
        <button onClick={onClose} className="p-2 glass rounded-full hover:bg-white/10 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-4 opacity-50">
            <div className="w-10 h-10 border-2 border-dashed border-white/20 rounded-full animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Carregando Acervo...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 gap-4 opacity-30 text-center">
            <Clock className="w-12 h-12" />
            <p className="text-sm font-medium">Nenhum projeto salvo ainda.<br/>Inicie sua primeira produção!</p>
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id}
              onClick={() => { onSelect(item.data); onClose(); }}
              className="group relative p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/30 hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white/80 line-clamp-1">{item.data.scenes[0].text}</h4>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => deleteItem(item.id, e)}
                  className="p-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-full opacity-40" />
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-orange-500 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-orange-500/5 text-center border-t border-white/5">
        <p className="text-[10px] font-black text-orange-500/60 uppercase tracking-[0.2em] mb-1">DS Creative Engine v2.0</p>
        <p className="text-[8px] text-white/20 uppercase font-bold tracking-widest">DS Company Technology</p>
      </div>
    </div>
  );
}
