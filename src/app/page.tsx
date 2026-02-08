"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Zap, Trophy, Brain, ArrowRight, Play, Upload, BookOpen } from "lucide-react";
import { useSettingsStore } from "@/stores";
import { dbService } from "@/lib/db";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { NeonCard } from "@/components/ui/NeonCard";
import { HudStat } from "@/components/ui/HudStat";
import Link from "next/link";

export default function Home() {
  const { userName, setUserName } = useSettingsStore();
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  
  const [stats, setStats] = useState({
    streak: 0,
    learnedWords: 0,
    accuracy: 0
  });

  const [loading, setLoading] = useState(true);

  // Check user name on mount
  useEffect(() => {
    const timer = setTimeout(() => {
        if (!userName) {
            setShowNameModal(true);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [userName]);

  useEffect(() => {
    const loadStats = async () => {
      const partidas = await dbService.getPartidas();
      const palabras = await dbService.getAllPalabras();
      
      const learned = palabras.filter(p => p.aciertos > 0).length;
      
      const totalHits = palabras.reduce((a, b) => a + b.aciertos, 0);
      const totalMisses = palabras.reduce((a, b) => a + b.fallos, 0);
      const total = totalHits + totalMisses;
      const acc = total > 0 ? Math.round((totalHits / total) * 100) : 0;
      
      const sortedPartidas = [...partidas].sort((a, b) => b.fecha - a.fecha);
      let currentStreak = 0;
      if (sortedPartidas.length > 0) {
         const uniqueDays = new Set(sortedPartidas.map(p => new Date(p.fecha).setHours(0,0,0,0)));
         const daysArray = Array.from(uniqueDays).sort((a, b) => b - a);
         
         const today = new Date().setHours(0,0,0,0);
         // If last game was today or yesterday
         if (daysArray[0] === today || daysArray[0] === today - 86400000) {
            currentStreak = 1;
            for (let i = 0; i < daysArray.length - 1; i++) {
                 const diff = (daysArray[i] - daysArray[i+1]) / 86400000;
                 if (diff <= 1) currentStreak++;
                 else break;
            }
         }
      }

      setStats({
        streak: currentStreak,
        learnedWords: learned,
        accuracy: acc
      });
      setLoading(false);
    };
    loadStats();
  }, []);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
        setUserName(nameInput.trim());
        setShowNameModal(false);
    }
  };

  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto">
      
      {/* 1. HERO SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-8 border-b border-white/5">
        <div className="space-y-2">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex items-center gap-2 text-[var(--brand-secondary)] uppercase tracking-widest font-bold text-xs"
           >
              <div className="w-2 h-2 bg-[var(--brand-secondary)] rounded-full animate-pulse" />
              LEXIFLOW SYSTEM
           </motion.div>
           
           <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
             HOLA, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]">{userName || 'INVITADO'}</span>
           </h1>
           <p className="text-gray-400 text-lg max-w-lg">
             Tu centro de entrenamiento. <span className="text-green-400 font-bold">Todo listo.</span>
           </p>
        </div>

        <div className="relative group">
            <div className="absolute inset-0 bg-[var(--brand-primary)] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
            <Link href="/game">
                <Button 
                    className="relative w-48 h-48 rounded-full border-4 border-[var(--brand-primary)]/30 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all group-hover:border-[var(--brand-primary)] shadow-[0_0_50px_-10px_var(--brand-primary)]"
                >
                    <Play className="w-16 h-16 fill-[var(--brand-primary)] text-[var(--brand-primary)] group-hover:text-white transition-colors" />
                    <span className="font-bold text-xl uppercase tracking-widest text-white">INICIAR</span>
                </Button>
            </Link>
        </div>
      </div>

      {/* 2. HUD STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <HudStat 
            label="Racha Actual" 
            value={`${stats.streak} DÍAS`} 
            icon={<Zap className="w-6 h-6" />} 
            color="#eab308"
            delay={0.1}
          />
          <HudStat 
            label="Vocabulario" 
            value={stats.learnedWords} 
            icon={<Brain className="w-6 h-6" />} 
            color="#a855f7"
            delay={0.2}
          />
          <HudStat 
            label="Precisión Global" 
            value={`${stats.accuracy}%`} 
            icon={<Trophy className="w-6 h-6" />} 
            color="#22c55e"
            delay={0.3}
          />
      </div>

      {/* 3. OPERATIONS DECK */}
      <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 mt-8 mb-4">Operations Deck</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/topics">
                <NeonCard color="primary" className="h-full" delay={0.4}>
                     <div className="flex items-start justify-between">
                         <div className="p-4 bg-[var(--brand-primary)]/10 rounded-2xl">
                             <BookOpen className="w-10 h-10 text-[var(--brand-primary)]" />
                         </div>
                         <ArrowRight className="w-6 h-6 text-gray-500 group-hover:text-[var(--brand-primary)] group-hover:translate-x-1 transition-all" />
                     </div>
                     <div className="mt-8">
                         <h3 className="text-3xl font-bold text-white mb-2">Mis Temas</h3>
                         <p className="text-gray-400">Accede a tu base de datos de vocabulario. Gestiona, edita y revisa tus listas.</p>
                     </div>
                </NeonCard>
            </Link>

            <Link href="/import">
                <NeonCard color="secondary" className="h-full" delay={0.5}>
                     <div className="flex items-start justify-between">
                         <div className="p-4 bg-[var(--brand-secondary)]/10 rounded-2xl">
                             <Upload className="w-10 h-10 text-[var(--brand-secondary)]" />
                         </div>
                         <ArrowRight className="w-6 h-6 text-gray-500 group-hover:text-[var(--brand-secondary)] group-hover:translate-x-1 transition-all" />
                     </div>
                     <div className="mt-8">
                         <h3 className="text-3xl font-bold text-white mb-2">Importar Datos</h3>
                         <p className="text-gray-400">Ingesta de nuevos datos vía Texto, PDF o OCR visual. Expande tu conocimiento.</p>
                     </div>
                </NeonCard>
            </Link>
      </div>

      <Modal
        isOpen={showNameModal}
        onClose={() => {}} 
        title="Bienvenido a LexiFlow"
      >
        <form onSubmit={handleSaveName} className="space-y-6">
          <div className="text-center">
            <div className="mb-4 inline-block p-4 rounded-full bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] animate-pulse">
                <Brain className="w-12 h-12" />
            </div>
            <p className="text-gray-300 mb-4 text-sm">
              Para guardar tu progreso, necesitamos saber tu nombre.
            </p>
          </div>
          <div>
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Tu nombre..."
              className="text-center text-lg h-14 bg-black/50 border-[var(--brand-primary)]/50 focus:border-[var(--brand-primary)] text-white tracking-wider"
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" className="w-full font-bold tracking-widest" disabled={!nameInput.trim()}>
            COMENZAR &gt;
          </Button>
        </form>
      </Modal>
    </div>
  );
}
