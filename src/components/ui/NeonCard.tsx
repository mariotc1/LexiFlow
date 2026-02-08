"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface NeonCardProps {
  children: ReactNode;
  className?: string;
  color?: "primary" | "secondary" | "success" | "warning";
  onClick?: () => void;
  delay?: number;
}

export function NeonCard({ children, className = "", color = "primary", onClick, delay = 0 }: NeonCardProps) {
  const colorMap = {
    primary: "var(--brand-primary)",
    secondary: "var(--brand-secondary)",
    success: "#22c55e",
    warning: "#eab308",
  };

  const selectedColor = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className={`relative group rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        boxShadow: `0 0 0 1px ${selectedColor}20`,
      }}
    >
      {/* Dynamic Glow Gradient Background */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{
            background: `radial-gradient(circle at center, ${selectedColor}, transparent 70%)`
        }}
      />

      {/* Animated Border Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8">
        {children}
      </div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-white/20 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-white/20 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-white/20 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-white/20 rounded-br-lg" />
    </motion.div>
  );
}
