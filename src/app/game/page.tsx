"use client";

import { useEffect, useState } from "react";
import { useTemaStore, useGameStore } from "@/stores";
import { dbService } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { Play, Check, ChevronRight, Globe, Shuffle, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NeonCard } from "@/components/ui/NeonCard";
import { TopicCard } from "@/components/TopicCard";

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

  const modes = [
    { 
        id: 'es-en', 
        label: 'ESPAÑOL → INGLÉS', 
        icon: <span className="text-2xl">🇪🇸 ➜ 🇬🇧</span>,
        desc: 'Construye tu vocabulario activo.' 
    },
    { 
        id: 'en-es', 
        label: 'INGLÉS → ESPAÑOL', 
        icon: <span className="text-2xl">🇬🇧 ➜ 🇪🇸</span>,
        desc: 'Mejora tu comprensión lectora.' 
    },
    { 
        id: 'mixto', 
        label: 'MODO MIXTO', 
        icon: <Shuffle className="w-8 h-8" />,
        desc: 'El desafío definitivo. Cambios al azar.' 
    },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
          <div className="p-3 bg-[var(--brand-primary)]/10 rounded-xl">
            <Play className="w-8 h-8 text-[var(--brand-primary)]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">SALA DE PREPARACIÓN</h1>
            <p className="text-gray-400">Configura los parámetros de tu sesión de entrenamiento.</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* LEFT: MODE SELECTOR */}
          <div className="lg:col-span-5 space-y-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">1. MODO DE COMBATE</h2>
              <div className="space-y-3">
                  {modes.map((m) => (
                      <div 
                        key={m.id}
                        onClick={() => setMode(m.id as any)}
                        className={`relative group cursor-pointer p-6 rounded-2xl border transition-all duration-300 overflow-hidden ${
                            mode === m.id 
                            ? 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)] shadow-[0_0_20px_-5px_var(--brand-primary)]' 
                            : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                          {/* Selection indicator */}
                          <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${mode === m.id ? 'bg-[var(--brand-primary)]' : 'bg-transparent'}`} />
                          
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                  <div className={`p-3 rounded-lg transition-colors ${mode === m.id ? 'bg-[var(--brand-primary)] text-black' : 'bg-white/5 text-gray-400'}`}>
                                      {m.icon}
                                  </div>
                                  <div>
                                      <h3 className={`font-bold text-lg ${mode === m.id ? 'text-white' : 'text-gray-300'}`}>{m.label}</h3>
                                      <p className="text-sm text-gray-500">{m.desc}</p>
                                  </div>
                              </div>
                              {mode === m.id && (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                      <Check className="w-6 h-6 text-[var(--brand-primary)]" />
                                  </motion.div>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* RIGHT: TOPIC PLAYLIST */}
          <div className="lg:col-span-7 flex flex-col h-full">
               <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">2. OBJETIVOS ({selectedTopics.length})</h2>
               
               <div className="flex-1 bg-black/20 rounded-3xl border border-white/5 p-4 overflow-hidden flex flex-col min-h-[400px]">
                   <div className="overflow-y-auto pr-2 space-y-2 flex-1 custom-scrollbar">
                       {temas.map((tema) => (
                           <motion.div
                                key={tema.id}
                                layout
                                onClick={() => toggleTopic(tema.id)}
                                className={`p-4 rounded-xl cursor-pointer border flex items-center justify-between transition-all ${
                                    selectedTopics.includes(tema.id)
                                    ? 'bg-[var(--brand-secondary)]/10 border-[var(--brand-secondary)]'
                                    : 'bg-white/5 border-transparent hover:bg-white/10'
                                }`}
                           >
                               <span className={`font-medium ${selectedTopics.includes(tema.id) ? 'text-white' : 'text-gray-400'}`}>
                                   {tema.nombre}
                               </span>
                               <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                   selectedTopics.includes(tema.id) 
                                   ? 'bg-[var(--brand-secondary)] border-[var(--brand-secondary)]' 
                                   : 'border-gray-600'
                               }`}>
                                   {selectedTopics.includes(tema.id) && <Check className="w-3 h-3 text-white" />}
                               </div>
                           </motion.div>
                       ))}
                       {temas.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 opacity-50">
                                <Languages className="w-12 h-12" />
                                <p>No hay temas disponibles.</p>
                            </div>
                       )}
                   </div>
               </div>
          </div>

      </div>

      {/* LAUNCH BAR */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black to-transparent z-40">
          <div className="max-w-4xl mx-auto">
              <Button
                size="lg"
                className="w-full h-20 text-2xl font-black tracking-widest shadow-[0_0_50px_-10px_var(--brand-primary)] hover:scale-[1.02] transition-transform bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)] border-t border-white/20"
                disabled={selectedTopics.length === 0 || loading}
                onClick={handleStart}
                isLoading={loading}
              >
                 <Play className="mr-3 w-8 h-8 fill-current" />
                 {loading ? 'INICIANDO SISTEMA...' : 'INICIAR MISIÓN'}
              </Button>
          </div>
      </div>
    </div>
  );
}
