"use client";

import { useEffect, useState } from "react";
import { dbService } from "@/lib/db";
import { Tema, Palabra, Partida } from "@/types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Loader2, Activity, Target, Clock, Database, TrendingUp, Cpu } from "lucide-react";
import { HudStat } from "@/components/ui/HudStat";
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    temas: Tema[];
    palabras: Palabra[];
    partidas: Partida[];
  }>({ temas: [], palabras: [], partidas: [] });

  useEffect(() => {
    const loadData = async () => {
      const [temas, palabras, partidas] = await Promise.all([
        dbService.getTemas(),
        dbService.getAllPalabras(),
        dbService.getPartidas()
      ]);
      setStats({ temas, palabras, partidas });
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center p-20 gap-4 h-[60vh]">
            <Loader2 className="w-12 h-12 animate-spin text-[var(--brand-primary)]" />
            <p className="font-mono text-[var(--brand-primary)] animate-pulse uppercase tracking-widest">Recopilando Datos Biométricos...</p>
        </div>
    );
  }

  const { palabras, partidas } = stats;

  const totalAciertos = palabras.reduce((acc, p) => acc + p.aciertos, 0);
  const totalFallos = palabras.reduce((acc, p) => acc + p.fallos, 0);
  const total = totalAciertos + totalFallos;
  const accuracy = total > 0 ? Math.round((totalAciertos / total) * 100) : 0;


  // Neon Chart Options
  const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
          legend: {
              labels: { color: '#9ca3af', font: { family: 'monospace' } }
          }
      },
      scales: {
          y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#6b7280', font: { family: 'monospace' } }
          },
          x: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#6b7280', font: { family: 'monospace' } }
          }
      }
  };

  // Chart Data: Global Accuracy
  const doughnutData = {
    labels: ['Aciertos', 'Fallos'],
    datasets: [
      {
        data: [totalAciertos, totalFallos],
        backgroundColor: ['rgba(74, 222, 128, 0.2)', 'rgba(248, 113, 113, 0.2)'],
        borderColor: ['#4ade80', '#f87171'],
        borderWidth: 2,
        hoverOffset: 10,
        hoverBorderWidth: 4,
      },
    ],
  };

  // Chart Data: Activity over last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const activityData = last7Days.map(date => {
    return partidas.filter(p => new Date(p.fecha).toISOString().split('T')[0] === date).length;
  });

  const lineData = {
    labels: last7Days.map(d => d.slice(5).replace('-', '/')),
    datasets: [
      {
        label: 'Sesiones',
        data: activityData,
        borderColor: '#00f3ff', // Cyan
        backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(0, 243, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 243, 255, 0)');
            return gradient;
        },
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#00f3ff',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 py-8">
        <div>
            <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex items-center gap-2 text-[var(--brand-primary)] uppercase tracking-widest font-bold text-xs mb-2"
           >
              <Cpu className="w-4 h-4 animate-pulse" />
              SISTEMA DE ANÁLISIS
           </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase">
              Rendimiento
            </h1>
            <p className="text-gray-400 mt-2">
                Métricas de desempeño y evolución cognitiva.
            </p>
        </div>
      </div>

      {/* HUD STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <HudStat 
              icon={<Database className="w-6 h-6" />} 
              label="PALABRAS REGISTRADAS" 
              value={palabras.length.toString()} 
              color="var(--brand-primary)"
          />
          <HudStat 
              icon={<Activity className="w-6 h-6" />} 
              label="SESIONES COMPLETADAS" 
              value={partidas.length.toString()} 
              color="var(--brand-secondary)"
          />
          <HudStat 
              icon={<Target className="w-6 h-6" />} 
              label="PRECISIÓN GLOBAL" 
              value={`${accuracy}%`} 
              color={accuracy >= 80 ? 'var(--brand-primary)' : '#eab308'}
          />

      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* ACTIVITY CHART */}
         <div className="lg:col-span-2 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-primary)]/5 to-[var(--brand-secondary)]/5 rounded-3xl blur-xl opacity-50" />
            <div className="relative h-full glass-panel p-8 border border-white/5 bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden">
                <div className="flex items-center gap-2 mb-6 text-[var(--brand-primary)]">
                    <TrendingUp className="w-5 h-5" />
                    <h3 className="font-bold tracking-widest text-sm uppercase">Actividad Reciente</h3>
                </div>
                <div className="h-[300px] w-full">
                    <Line data={lineData} options={commonOptions} />
                </div>
            </div>
         </div>
         
         {/* ACCURACY CHART */}
         <div className="lg:col-span-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-red-500/5 rounded-3xl blur-xl opacity-50" />
            <div className="relative h-full glass-panel p-8 border border-white/5 bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-6 text-white">
                    <Target className="w-5 h-5" />
                    <h3 className="font-bold tracking-widest text-sm uppercase">Distribución de Aciertos</h3>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="w-full max-w-[320px]">
                        <Doughnut 
                            data={doughnutData} 
                            options={{
                                ...commonOptions,
                                plugins: {
                                    legend: { position: 'bottom', labels: { color: '#fff', font: { family: 'monospace' } } }
                                },
                                cutout: '70%',
                                layout: {
                                    padding: 20
                                }
                            }} 
                        />
                    </div>
                </div>
                {total > 0 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-8 text-center pointer-events-none">
                        <span className="text-3xl font-black text-white">{accuracy}%</span>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">Ratio</div>
                    </div>
                )}
            </div>
         </div>

      </div>
    </div>
  );
}
