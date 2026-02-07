"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/stores";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { dbService } from "@/lib/db";
import { Trophy, RefreshCw, Home, Brain, Zap, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/sound";

export default function ResultsPage() {
  const { score, results, words, resultsDetails, gameMode, resetGame } = useGameStore();
  const router = useRouter();
  const savedRef = useRef(false);
  const [saving, setSaving] = useState(true);

  useEffect(() => {
    if (savedRef.current || words.length === 0) {
        setSaving(false);
        return;
    }
    
    const saveStats = async () => {
        savedRef.current = true;
        sfx.playWin();

        try {
            // 1. Update Word Stats
            const updatePromises = resultsDetails.map(r => 
                dbService.updatePalabraStats(r.wordId, r.correct)
            );
            await Promise.all(updatePromises);
            
            // 2. Save Game History (Partida)
            // We need a unique topic ID. Assuming all words are from same topic for now, 
            // or we grab from the first word.
            const topicId = words[0]?.idTema || "unknown"; // Fallback
            
            await dbService.savePartida({
                id: crypto.randomUUID(),
                fecha: Date.now(),
                idTema: topicId,
                modo: gameMode,
                puntuacion: score,
                tiempoTotal: 0, // Not tracked yet
                respuestas: resultsDetails.map(r => ({
                    idPalabra: r.wordId,
                    respuestaUsuario: "", // Not tracking text yet
                    correcta: r.correct,
                    casiCorrecta: false,
                    tiempoRespuesta: 0
                }))
            });

        } catch (error) {
            console.error("Error saving stats:", error);
        } finally {
            setSaving(false);
        }
    };

    saveStats();
  }, [words, resultsDetails, score, gameMode]);

  const accuracy = Math.round((results.correct / (resultsDetails.length || 1)) * 100) || 0;

  if (words.length === 0) {
      // Valid fallback for direct access
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <p className="text-gray-400 mb-4">No hay resultados recientes.</p>
              <Button onClick={() => router.push('/')}>Volver al Inicio</Button>
          </div>
      );
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center max-w-4xl mx-auto space-y-12">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full" />
        <Trophy className="h-40 w-40 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)] relative z-10" />
      </motion.div>

      <div className="space-y-4 text-center">
        <h1 className="text-5xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500">
            {accuracy >= 80 ? "¡Impresionante!" : "¡Bien Jugado!"}
        </h1>
        <p className="text-xl text-gray-300">
            Has completado tu sesión de práctica.
            {saving && <span className="ml-2 text-sm animate-pulse text-[var(--brand-primary)]">(Guardando progreso...)</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-panel p-8 flex flex-col items-center justify-center gap-2"
        >
            <Zap className="w-8 h-8 text-yellow-400 mb-2" />
            <div className="text-gray-400 font-medium uppercase tracking-widest text-xs">Puntuación</div>
            <div className="text-4xl font-bold text-white">{score}</div>
        </motion.div>
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-panel p-8 flex flex-col items-center justify-center gap-2"
        >
            <Brain className="w-8 h-8 text-[var(--brand-secondary)] mb-2" />
            <div className="text-gray-400 font-medium uppercase tracking-widest text-xs">Palabras</div>
            <div className="text-4xl font-bold text-white">{resultsDetails.length}</div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={`glass-panel p-8 flex flex-col items-center justify-center gap-2 border-b-4 ${accuracy >= 80 ? 'border-green-500' : 'border-yellow-500'}`}
        >
            {accuracy >= 80 ? <CheckCircle className="w-8 h-8 text-green-400 mb-2" /> : <RefreshCw className="w-8 h-8 text-yellow-400 mb-2" />}
            <div className="text-gray-400 font-medium uppercase tracking-widest text-xs">Precisión</div>
            <div className={`text-4xl font-bold ${accuracy >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                {accuracy}%
            </div>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-xl pt-8">
        <Button 
            variant="ghost" 
            className="flex-1 h-14 text-lg border border-white/10 hover:bg-white/5"
            onClick={() => {
                resetGame();
                router.push("/");
            }}
        >
            <Home className="mr-2 h-5 w-5" /> Volver al Inicio
        </Button>
        <Button 
            variant="primary" 
            className="flex-1 h-14 text-lg shadow-xl shadow-[var(--brand-primary)]/20"
            onClick={() => {
                resetGame();
                router.push("/game");
            }}
        >
            <RefreshCw className="mr-2 h-5 w-5" /> Jugar Otra Vez
        </Button>
      </div>
    </div>
  );
}
