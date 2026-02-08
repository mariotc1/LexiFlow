"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, PlayCircle, BarChart2, FolderInput, BrainCircuit, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: BookOpen, label: "Mis Temas", href: "/topics" },
  { icon: PlayCircle, label: "Jugar", href: "/game" },
  { icon: BarChart2, label: "Estadísticas", href: "/stats" },
  { icon: FolderInput, label: "Importar", href: "/import" },
  { icon: BrainCircuit, label: "Práctica IA", href: "/difficult" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-4">
        <div className="font-bold text-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] bg-clip-text text-transparent">
            LexiFlow
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/80 z-50"
                />
                
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-0 left-0 bottom-0 w-3/4 max-w-sm bg-[#0a0a0f] border-r border-white/10 z-50 flex flex-col p-6"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white">Menú</h2>
                        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                            <X className="w-6 h-6 text-gray-400" />
                        </Button>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                            <div className={cn(
                                "flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-medium transition-colors",
                                isActive 
                                ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20" 
                                : "text-gray-400 hover:bg-white/5 active:bg-white/10"
                            )}>
                                <item.icon className={cn("h-5 w-5", isActive ? "text-[var(--brand-primary)]" : "text-gray-400")} />
                                <span>{item.label}</span>
                            </div>
                            </Link>
                        );
                        })}
                    </nav>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="rounded-xl bg-gradient-to-br from-[var(--brand-secondary)]/20 to-transparent p-4 border border-[var(--brand-secondary)]/30">
                            <p className="text-xs font-semibold text-[var(--brand-secondary)] mb-1">PRO TIP</p>
                            <p className="text-xs text-gray-400">Practica 5 min al día para mejorar tu racha.</p>
                        </div>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </>
  );
}
