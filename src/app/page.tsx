"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Zap, Trophy, Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Hola, Mario 👋</h1>
          <p className="text-gray-400">Listo para superar tu racha de hoy?</p>
        </div>
        <Button variant="primary" size="lg" className="shadow-lg shadow-[var(--brand-primary)]/20">
          <Zap className="mr-2 h-5 w-5" />
          Repaso Rápido
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Racha actual</p>
              <h3 className="text-2xl font-bold">12 días</h3>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[var(--brand-secondary)]/10 text-[var(--brand-secondary)]">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Palabras aprendidas</p>
              <h3 className="text-2xl font-bold">843</h3>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Precisión</p>
              <h3 className="text-2xl font-bold">92%</h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity or Suggestions */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-[var(--brand-primary)] rounded-full"/>
          Continuar Aprendiendo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mock Cards for now, will connect to store */}
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="glass p-5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group border border-white/5 hover:border-[var(--brand-primary)]/30"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-bold px-3 py-1 rounded-full border border-[var(--brand-primary)]/20">
                  Topic {i}
                </span>
                <span className="text-xs text-gray-500">Hace 2 horas</span>
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--brand-primary)] transition-colors">Business English</h3>
              <p className="text-sm text-gray-400 mb-4">50 palabras • Nivel Intermedio</p>
              
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] h-full w-3/4" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
