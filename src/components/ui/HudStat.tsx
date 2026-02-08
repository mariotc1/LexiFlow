"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface HudStatProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  delay?: number;
}

export function HudStat({ label, value, icon, color = "var(--brand-primary)", delay = 0 }: HudStatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className="relative overflow-hidden rounded-2xl bg-black/30 border border-white/5 p-4 flex items-center gap-4 group hover:bg-white/5 transition-colors"
    >
      {/* Scanning Line Animation */}
      <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 animate-scan" style={{ animationDuration: '2s' }} />

      {/* Icon Box */}
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
        style={{ 
            backgroundColor: `${color}20`,
            color: color,
            boxShadow: `0 0 15px ${color}30`
        }}
      >
        {icon}
      </div>

      {/* Data */}
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-[0.15em] text-gray-400 font-mono mb-1">{label}</span>
        <span className="text-2xl md:text-3xl font-black text-white font-mono tracking-tighter shadow-black drop-shadow-lg">
            {value}
        </span>
      </div>

      {/* Decorative Tech Bits */}
      <div className="absolute right-2 top-2 flex gap-1">
        <div className="w-1 h-1 rounded-full bg-white/20" />
        <div className="w-1 h-1 rounded-full bg-white/20" />
      </div>
    </motion.div>
  );
}
