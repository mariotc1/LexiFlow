"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, PlayCircle, BarChart2, FolderInput, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: BookOpen, label: "Mis Temas", href: "/topics" },
  { icon: PlayCircle, label: "Jugar", href: "/game" },
  { icon: BarChart2, label: "Estadísticas", href: "/stats" },
  { icon: FolderInput, label: "Importar", href: "/import" },
  { icon: BrainCircuit, label: "Práctica IA", href: "/difficult" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/5 bg-[var(--background)]/80 backdrop-blur-xl hidden md:flex flex-col">
      <div className="flex h-20 items-center px-6 border-b border-white/5">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] bg-clip-text text-transparent">
          LexiFlow
        </h1>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] shadow-[0_0_15px_rgba(0,243,255,0.1)]" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}>
                <item.icon className={cn("h-5 w-5", isActive ? "text-[var(--brand-primary)]" : "text-gray-400 group-hover:text-white")} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 h-8 w-1 rounded-r-full bg-[var(--brand-primary)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="rounded-xl bg-gradient-to-br from-[var(--brand-secondary)]/20 to-transparent p-4 border border-[var(--brand-secondary)]/30">
          <p className="text-xs font-semibold text-[var(--brand-secondary)] mb-1">PRO TIP</p>
          <p className="text-xs text-gray-400">Practica 5 min al día para mejorar tu racha.</p>
        </div>
      </div>
    </aside>
  );
}
