"use client";

import { NeonCard } from "./ui/NeonCard";
import { Folder, Play, Trash2, Edit, Book, Layers } from "lucide-react";
import { Button } from "./ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";

interface TopicCardProps {
  id: string;
  name: string;
  wordCount: number;
  lastPlayed?: number;
  onDelete: (e: React.MouseEvent) => void;
  index: number;
}

export function TopicCard({ id, name, wordCount, lastPlayed, onDelete, index }: TopicCardProps) {
  return (
    <Link href={`/topics/${id}`}>
        <NeonCard color="primary" delay={index * 0.1} className="h-full group/card relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_-5px_var(--brand-primary)]">
            
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] group-hover/card:bg-[var(--brand-primary)] group-hover/card:text-black transition-colors shadow-[0_0_15px_-5px_var(--brand-primary)]">
                    <Layers className="w-8 h-8" />
                </div>
                
                {/* Actions that appear on hover */}
                <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="flex gap-2"
                >
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        title="Eliminar tema"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </motion.div>
            </div>

            <div className="relative z-10">
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover/card:text-[var(--brand-primary)] transition-colors line-clamp-1" title={name}>
                    {name}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-gray-400 font-mono mt-4">
                    <div className="flex items-center gap-1.5">
                        <Book className="w-4 h-4 text-[var(--brand-secondary)]" />
                        <span>{wordCount} PALABRAS</span>
                    </div>
                </div>

                {/* Progress Bar (Fake mastery for now, or real if we had it) */}
                <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--brand-primary)] w-[0%] group-hover/card:w-full transition-all duration-700 ease-out" />
                </div>
            </div>

            {/* "Play" Action Overlay */}
            <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover/card:opacity-100 transition-opacity translate-y-4 group-hover/card:translate-y-0 duration-300">
                <div className="flex items-center gap-2 text-[var(--brand-primary)] font-bold text-sm uppercase tracking-wider">
                    EXPLORAR <Play className="w-4 h-4 fill-current" />
                </div>
            </div>
        </NeonCard>
    </Link>
  );
}
