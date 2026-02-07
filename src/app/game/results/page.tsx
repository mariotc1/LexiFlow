"use client";

import { useEffect } from "react";
import { useGameStore } from "@/stores";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { dbService } from "@/lib/db";
import { Trophy, RefreshCw, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function ResultsPage() {
  const { score, results, words, resetGame } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    // Save stats?
    // In a real app we'd save the session to IDB here or in store
    // For now we just display
  }, []); // eslint-disable-line

  const accuracy = Math.round((results.correct / words.length) * 100) || 0;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="relative inline-block">
          <Trophy className="h-32 w-32 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
        </div>
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">¡Sesión Completada!</h1>
        <p className="text-gray-400">Has repasado {words.length} palabras</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="glass-panel p-6">
            <div className="text-gray-400 text-sm mb-1">Puntuación</div>
            <div className="text-3xl font-bold text-[var(--brand-primary)]">{score}</div>
        </div>
        <div className="glass-panel p-6">
            <div className="text-gray-400 text-sm mb-1">Precisión</div>
            <div className={`text-3xl font-bold ${accuracy >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                {accuracy}%
            </div>
        </div>
      </div>

      <div className="flex gap-4 w-full pt-8">
        <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
                resetGame();
                router.push("/");
            }}
        >
            <Home className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Button 
            variant="primary" 
            className="flex-1"
            onClick={() => {
                resetGame();
                router.push("/game");
            }}
        >
            <RefreshCw className="mr-2 h-4 w-4" /> Jugar Otra Vez
        </Button>
      </div>
    </div>
  );
}
