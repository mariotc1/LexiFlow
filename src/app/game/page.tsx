"use client";

import { useEffect, useState } from "react";
import { useTemaStore, useGameStore } from "@/stores";
import { dbService } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { Play, Check, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function GameSetupPage() {
  const { temas, loadTemas } = useTemaStore();
  const { startGame } = useGameStore();
  const router = useRouter();

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [mode, setMode] = useState<'es-en' | 'en-es' | 'mixto'>('mixto');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemas();
  }, [loadTemas]);

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleStart = async () => {
    if (selectedTopics.length === 0) return;
    setLoading(true);

    try {
      // Fetch words from selected topics
      const allWords = (await Promise.all(
        selectedTopics.map(id => dbService.getPalabras(id))
      )).flat();

      if (allWords.length === 0) {
        alert("Los temas seleccionados no tienen palabras.");
        setLoading(false);
        return;
      }

      startGame(allWords, mode);
      router.push("/game/play");
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]">
          Configurar Partida
        </h1>
        <p className="text-gray-400">Selecciona los temas y el modo de juego</p>
      </div>

      {/* Mode Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">1. Modo de Juego</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'es-en', label: 'Español → Inglés', desc: 'Traduce al inglés' },
            { id: 'en-es', label: 'Inglés → Español', desc: 'Traduce al español' },
            { id: 'mixto', label: 'Mixto', desc: 'Aleatorio' },
          ].map((m) => (
            <div
              key={m.id}
              onClick={() => setMode(m.id as any)}
              className={`p-4 rounded-xl cursor-pointer border transition-all ${
                mode === m.id
                  ? 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]'
                  : 'bg-white/5 border-transparent hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-bold ${mode === m.id ? 'text-[var(--brand-primary)]' : 'text-white'}`}>
                  {m.label}
                </span>
                {mode === m.id && <Check className="h-4 w-4 text-[var(--brand-primary)]" />}
              </div>
              <p className="text-xs text-gray-400">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">2. Selecciona Temas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
          {temas.map((tema) => (
            <div
              key={tema.id}
              onClick={() => toggleTopic(tema.id)}
              className={`p-4 rounded-xl cursor-pointer border transition-all flex items-center justify-between ${
                selectedTopics.includes(tema.id)
                  ? 'bg-[var(--brand-secondary)]/10 border-[var(--brand-secondary)]'
                  : 'bg-white/5 border-transparent hover:bg-white/10'
              }`}
            >
              <span className={selectedTopics.includes(tema.id) ? 'text-[var(--brand-secondary)] font-bold' : 'text-gray-300'}>
                {tema.nombre}
              </span>
              {selectedTopics.includes(tema.id) && <Check className="h-4 w-4 text-[var(--brand-secondary)]" />}
            </div>
          ))}
          {temas.length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-8">No hay temas disponibles. Crea uno primero.</p>
          )}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <Button
          size="lg"
          className="w-full md:w-auto px-12 neon-border"
          disabled={selectedTopics.length === 0 || loading}
          onClick={handleStart}
          isLoading={loading}
        >
          <Play className="mr-2 h-5 w-5 fill-current" />
          Comenzar Partida
        </Button>
      </div>
    </div>
  );
}
