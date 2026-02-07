"use client";

import { useEffect, useState } from "react";
import { dbService } from "@/lib/db";
import { Palabra } from "@/types";
import { useGameStore } from "@/stores";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Play } from "lucide-react";

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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
            <AlertTriangle className="h-8 w-8" />
        </div>
        <div>
            <h1 className="text-3xl font-bold">Palabras Difíciles</h1>
            <p className="text-gray-400">Repasa las palabras que más te cuestan</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Analizando tu progreso...</div>
      ) : words.length === 0 ? (
        <div className="glass-panel p-12 text-center space-y-4 border-dashed border-2 border-green-500/20">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold text-green-400">¡Todo bajo control!</h2>
            <p className="text-gray-400">No tienes palabras marcadas como difíciles por ahora.</p>
            <Button onClick={() => router.push('/game')}>Jugar Normal</Button>
        </div>
      ) : (
        <div className="space-y-6">
            <div className="glass-panel p-6 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold">{words.length} palabras detectadas</h3>
                    <p className="text-sm text-gray-400">Estas palabras tienen una tasa de error alta.</p>
                </div>
                <Button size="lg" onClick={handleStart} className="shadow-lg shadow-red-500/20">
                    <Play className="mr-2 h-5 w-5" /> Practicar Ahora
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {words.map(w => (
                    <div key={w.id} className="p-4 rounded-xl bg-white/5 border border-red-500/20 flex justify-between items-center">
                        <div>
                            <div className="font-bold">{w.ingles}</div>
                            <div className="text-sm text-gray-400">{w.espanol}</div>
                        </div>
                        <div className="text-xs font-mono text-red-400">
                            {w.fallos} fallos
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
