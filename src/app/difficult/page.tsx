"use client";

import { useEffect, useState } from "react";
import { dbService } from "@/lib/db";
import { Palabra } from "@/types";
import { useGameStore } from "@/stores";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Play, Brain, CheckCircle } from "lucide-react";

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
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="p-4 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <Brain className="h-10 w-10" />
        </div>
        <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Práctica Focalizada</h1>
            <p className="text-lg text-gray-400">El sistema detecta automáticamente las palabras que te cuestan más.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-gray-500 animate-pulse text-xl">Analizando tu rendimiento...</div>
      ) : words.length === 0 ? (
        <div className="glass-panel p-16 text-center space-y-6 border border-green-500/20 bg-green-500/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600" />
            <div className="mx-auto w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">¡Todo Dominado!</h2>
            <p className="text-xl text-gray-400 max-w-lg mx-auto">
                No tienes palabras marcadas como "difíciles" en este momento. ¡Sigue jugando para desafiarte más!
            </p>
            <div className="pt-6">
                <Button size="lg" onClick={() => router.push('/game')} className="shadow-lg shadow-green-500/20">
                    Jugar Modo Normal
                </Button>
            </div>
        </div>
      ) : (
        <div className="space-y-8">
            <div className="glass-panel p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                         <AlertTriangle className="text-yellow-500 w-6 h-6" />
                         {words.length} palabras prioritarias
                    </h3>
                    <p className="text-gray-400 mt-1">Estas palabras tienen una tasa de error superior al acierto.</p>
                </div>
                <Button size="lg" onClick={handleStart} className="w-full md:w-auto px-8 h-14 text-lg shadow-xl shadow-red-500/20 hover:scale-105 transition-transform bg-red-600 hover:bg-red-700 border-none text-white">
                    <Play className="mr-2 h-5 w-5" /> Iniciar Sesión de Repaso
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {words.map(w => (
                    <div key={w.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-red-500/30 transition-all group relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start mb-2">
                             <h4 className="text-xl font-bold text-white">{w.ingles}</h4>
                             <span className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-1 rounded-md">
                                 {w.fallos} fallos
                             </span>
                        </div>
                        <div className="text-gray-400">{w.espanol}</div>
                        
                        <div className="mt-4 w-full bg-gray-700/30 h-1.5 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-red-500" 
                                style={{ width: `${Math.min(100, (w.fallos / (w.aciertos + w.fallos) * 100))}%` }} 
                             />
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
