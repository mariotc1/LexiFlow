"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Zap, Trophy, Brain, ArrowRight } from "lucide-react";
import { useSettingsStore, useTemaStore } from "@/stores";
import { dbService } from "@/lib/db";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
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
    // Small delay to allow hydration of persisted store
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
      
      // Calculate Stats
      // 1. Learned Words (words with > 0 hits)
      const learned = palabras.filter(p => p.aciertos > 0).length;
      
      // 2. Accuracy
      const totalHits = palabras.reduce((a, b) => a + b.aciertos, 0);
      const totalMisses = palabras.reduce((a, b) => a + b.fallos, 0);
      const total = totalHits + totalMisses;
      const acc = total > 0 ? Math.round((totalHits / total) * 100) : 0;
      
      // 3. Streak (consecutive days with at least 1 game)
      // Sort partidas by date descending
      const sortedPartidas = [...partidas].sort((a, b) => b.fecha - a.fecha);
      let currentStreak = 0;
      if (sortedPartidas.length > 0) {
        const today = new Date().setHours(0,0,0,0);
        const lastGameDay = new Date(sortedPartidas[0].fecha).setHours(0,0,0,0);
        
        // If last game was today or yesterday, streak is alive
        if (today - lastGameDay <= 86400000) {
            currentStreak = 1;
            let checkDate = lastGameDay;
            
            // Check previous days
            // Simple logic: unique days
            const uniqueDays = new Set(sortedPartidas.map(p => new Date(p.fecha).setHours(0,0,0,0)));
            // We need to check continuity.
            // ... simple version: just count unique days for now as "Total Active Days" or fix streak logic later.
            // Let's implement real streak:
             const daysArray = Array.from(uniqueDays).sort((a, b) => b - a);
             
             for (let i = 0; i < daysArray.length - 1; i++) {
                 const diff = (daysArray[i] - daysArray[i+1]) / 86400000;
                 if (diff <= 1) { // Consecutive day (1 day diff)
                     currentStreak++;
                 } else {
                     break;
                 }
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
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-md">
            ¡Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]">{userName || 'Estudiante'}</span>! 👋
          </h1>
          <p className="text-indigo-100 text-lg">¿Listo para romper tu récord hoy?</p>
        </div>
        <Link href="/game">
            <Button variant="primary" size="lg" className="shadow-lg shadow-[var(--brand-primary)]/40 hover:scale-105 transition-transform animate-bounce-slow">
            <Zap className="mr-2 h-5 w-5 fill-current" />
            Jugar Ahora
            </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 border-l-4 border-yellow-400 bg-gradient-to-br from-yellow-500/10 to-transparent"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-yellow-400/20 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
              <Zap className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-yellow-100 font-medium uppercase tracking-wider">Racha</p>
              <h3 className="text-3xl font-bold text-white">{stats.streak} días</h3>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 border-l-4 border-[var(--brand-secondary)] bg-gradient-to-br from-[var(--brand-secondary)]/10 to-transparent"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-[var(--brand-secondary)]/20 text-[var(--brand-secondary)] shadow-[0_0_15px_rgba(188,19,254,0.3)]">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-purple-100 font-medium uppercase tracking-wider">Aprendidas</p>
              <h3 className="text-3xl font-bold text-white">{stats.learnedWords}</h3>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 border-l-4 border-green-400 bg-gradient-to-br from-green-500/10 to-transparent"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-green-400/20 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-green-100 font-medium uppercase tracking-wider">Precisión</p>
              <h3 className="text-3xl font-bold text-white">{stats.accuracy}%</h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/topics">
            <motion.div 
                whileHover={{ scale: 1.02, rotate: -1 }}
                className="glass-panel p-8 cursor-pointer group relative overflow-hidden h-full"
            >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Brain className="w-32 h-32" />
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-[var(--brand-primary)] transition-colors">Mis Temas</h3>
                <p className="text-gray-300 mb-6">Gestiona tus listas de vocabulario y añade nuevas palabras.</p>
                <div className="flex items-center text-[var(--brand-primary)] font-bold">
                    Gestionar <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
            </motion.div>
        </Link>

        <Link href="/import">
            <motion.div 
                 whileHover={{ scale: 1.02, rotate: 1 }}
                 className="glass-panel p-8 cursor-pointer group relative overflow-hidden h-full"
            >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap className="w-32 h-32" />
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-[var(--brand-secondary)] transition-colors">Importar Contenido</h3>
                <p className="text-gray-300 mb-6">Usa IA para escanear fotos, subir archivos o pegar texto.</p>
                <div className="flex items-center text-[var(--brand-secondary)] font-bold">
                    Importar <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
            </motion.div>
        </Link>
      </div>

      <Modal
        isOpen={showNameModal}
        onClose={() => {}} // Force entry
        title="¡Bienvenido a LexiFlow!"
      >
        <form onSubmit={handleSaveName} className="space-y-6">
          <div className="text-center">
            <div className="mb-4 inline-block p-4 rounded-full bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]">
                <Brain className="w-12 h-12" />
            </div>
            <p className="text-gray-300 mb-4">
              Antes de empezar, ¿cómo te gustaría que te llamemos?
            </p>
          </div>
          <div>
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Tu nombre..."
              className="text-center text-lg h-14 bg-white/10 border-white/20 focus:border-[var(--brand-primary)]"
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={!nameInput.trim()}>
            Comenzar Aventura 🚀
          </Button>
        </form>
      </Modal>
    </div>
  );
}
