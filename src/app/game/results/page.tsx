"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/stores";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { dbService } from "@/lib/db";
import { Trophy, RefreshCw, Home, Brain, Zap, CheckCircle, XCircle, Target, Award } from "lucide-react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/sound";
import { HudStat } from "@/components/ui/HudStat";
import { NeonCard } from "@/components/ui/NeonCard";

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
  const isWin = accuracy >= 80;

  if (words.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
              <p className="text-gray-400 font-mono animate-pulse uppercase tracking-widest">No mission data found.</p>
              <Button onClick={() => router.push('/')} variant="primary">VOLVER AL CENTRO DE MANDO</Button>
          </div>
      );
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center max-w-5xl mx-auto py-12 px-4 space-y-16">
      
      {/* HEADER SECTION */}
      <motion.div 
         initial={{ scale: 0.8, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         className="relative text-center"
      >
        <div className={`absolute inset-0 blur-[100px] opacity-40 rounded-full ${isWin ? 'bg-green-500' : 'bg-orange-500'}`} />
        
        <div className="relative z-10 flex flex-col items-center">
            <motion.div 
                initial={{ y: -20 }} animate={{ y: 0 }}
                className={`mb-4 px-4 py-1 rounded-full border ${isWin ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'} uppercase tracking-[0.3em] text-xs font-bold font-mono`}
            >
                {saving ? "TRANSMITIENDO DATOS..." : "REPORTE DE MISIÓN"}
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 shadow-black drop-shadow-2xl">
                {isWin ? "MISIÓN CUMPLIDA" : "MISIÓN FINALIZADA"}
            </h1>
            
            <p className="text-xl text-gray-400 max-w-lg mx-auto">
                {isWin 
                    ? "Rendimiento óptimo detectado. Sus capacidades lingüísticas han mejorado." 
                    : "Se requieren ajustes en los parámetros de entrenamiento. Reintentar sugerido."
                }
            </p>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <HudStat 
            delay={0.2}
            icon={<Zap className="w-6 h-6" />}
            label="PUNTUACIÓN TOTAL"
            value={score.toString()}
            color="var(--brand-primary)"
        />
        <HudStat 
            delay={0.3}
            icon={<Brain className="w-6 h-6" />}
            label="PALABRAS DOMINADAS"
            value={`${results.correct}/${resultsDetails.length}`}
            color="var(--brand-secondary)"
        />
        <HudStat 
            delay={0.4}
            icon={<Target className="w-6 h-6" />}
            label="PRECISIÓN TÁCTICA"
            value={`${accuracy}%`}
            color={isWin ? "#4ade80" : "#fbbf24"}
        />
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        <NeonCard 
            color="secondary" 
            delay={0.5} 
            onClick={() => {
                resetGame();
                router.push("/");
            }}
            className="group cursor-pointer flex items-center justify-between p-8 hover:bg-white/5"
        >
            <div className="flex flex-col">
                <span className="text-gray-400 text-xs uppercase tracking-widest font-mono mb-1">RETIRADA</span>
                <span className="text-2xl font-bold text-white group-hover:text-[var(--brand-secondary)] transition-colors">Volver al Inicio</span>
            </div>
            <Home className="w-8 h-8 text-gray-500 group-hover:text-[var(--brand-secondary)] transition-colors" />
        </NeonCard>

        <NeonCard 
            color="primary" 
            delay={0.6}
            onClick={() => {
                resetGame();
                router.push("/game");
            }}
             className="group cursor-pointer flex items-center justify-between p-8 hover:bg-white/5"
        >
             <div className="flex flex-col">
                <span className="text-gray-400 text-xs uppercase tracking-widest font-mono mb-1">NUEVO DESPLIEGUE</span>
                <span className="text-2xl font-bold text-white group-hover:text-[var(--brand-primary)] transition-colors">Jugar Otra Vez</span>
            </div>
            <RefreshCw className="w-8 h-8 text-gray-500 group-hover:text-[var(--brand-primary)] transition-colors group-hover:rotate-180 transition-transform duration-500" />
        </NeonCard>
      </div>
    </div>
  );
}
