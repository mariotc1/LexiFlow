"use client";

import { useEffect, useState } from "react";
import { dbService } from "@/lib/db";
import { Palabra } from "@/types";
import { useGameStore } from "@/stores";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Play, Brain, CheckCircle, Flame, ShieldAlert, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NeonCard } from "@/components/ui/NeonCard";

export default function DifficultWordsPage() {
  const [words, setWords] = useState<Palabra[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { startGame } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    const loadWords = async () => {
      const all = await dbService.getAllPalabras();
      // Filter words with more failures than success OR high failure count
      const difficult = all.filter(p => p.fallos > 0 && (p.fallos > p.aciertos || p.fallos > 2));
      setWords(difficult);
      setLoading(false);
    };
    loadWords();
  }, []);

  const handleStart = () => {
    startGame(words, 'mixto');
    router.push('/game/play');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 pt-4 px-4 min-h-[90vh]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 py-6">
        <div>
             <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-red-500 uppercase tracking-widest font-bold text-xs mb-2"
            >
                <ShieldAlert className="w-4 h-4 animate-pulse" />
                PROTOCOLOS DAÑADOS DETECTADOS
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">ZONA CRÍTICA</span>
            </h1>
            <p className="text-gray-400 mt-2 max-w-xl">
                El sistema ha aislado {words.length} conceptos con alta tasa de fallo. Se requiere intervención inmediata.
            </p>
        </div>
        
        {!loading && words.length > 0 && (
            <Button 
                size="lg" 
                onClick={handleStart} 
                className="w-full md:w-auto px-8 h-16 text-lg font-black uppercase tracking-widest shadow-[0_0_30px_-5px_var(--red-500)] bg-red-600 hover:bg-red-700 border border-red-400/30"
            >
                <Activity className="mr-3 h-6 w-6 animate-bounce" /> INICIAR REPARACIÓN DE MEMORIA
            </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
             <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
             <div className="text-red-500 font-mono animate-pulse uppercase tracking-widest">Escaneando red neuronal...</div>
        </div>
      ) : words.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="relative mb-8">
                 <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
                 <CheckCircle className="w-32 h-32 text-green-400 relative z-10" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4 uppercase">SISTEMA ESTABLE</h2>
            <p className="text-xl text-gray-400 max-w-lg mx-auto mb-8">
                No se detectan anomalías en la memoria a largo plazo. Todas las palabras están bajo control.
            </p>
            <Button size="lg" onClick={() => router.push('/game')} className="h-14 px-8 text-lg font-bold shadow-[0_0_20px_-5px_var(--brand-primary)]">
                REGRESAR A ENTRENAMIENTO ESTÁNDAR
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
                {words.map((w, i) => (
                    <NeonCard 
                        key={w.id} 
                        color="success" // Using 'success' prop but styling specifically below with red overrides if needed, or stick to standard color props. Actually NeonCard supports custom colors via className generally or I can add a 'danger' prop. 
                        // Since I didn't add 'danger' to NeonCard props, I'll use a hack or just style standard.
                        // Let's use standard NeonCard but style specific parts red.
                        delay={i * 0.05}
                        className="p-6 border-l-4 border-l-red-500 hover:bg-red-500/5 group"
                        // Force override border color via inline style or class if strictly needed, but let's stick to the 'Clean' look.
                    >
                        <div className="flex justify-between items-start mb-4">
                             <div className="bg-red-500/10 p-3 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                <AlertTriangle className="w-6 h-6" />
                             </div>
                             <div className="text-xs font-mono text-red-400 bg-red-950/30 px-2 py-1 rounded border border-red-500/20">
                                 {w.fallos} ERRORES CRÍTICOS
                             </div>
                        </div>
                        
                        <h4 className="text-2xl font-black text-white mb-1">{w.ingles}</h4>
                        <div className="text-lg text-gray-400 font-mono mb-4">{w.espanol}</div>
                        
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-red-500 shadow-[0_0_10px_red]" 
                                style={{ width: `${Math.min(100, (w.fallos / (w.aciertos + w.fallos || 1) * 100))}%` }} 
                             />
                        </div>
                        <div className="mt-2 text-[10px] text-gray-500 text-right uppercase tracking-wider font-bold">
                            TASA DE FALLO: {Math.round((w.fallos / (w.aciertos + w.fallos || 1) * 100))}%
                        </div>
                    </NeonCard>
                ))}
            </AnimatePresence>
        </div>
      )}
    </div>
  );
}
