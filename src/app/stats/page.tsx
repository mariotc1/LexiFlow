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
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Loader2 } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
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
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[var(--brand-primary)]" /></div>;
  }

  const { palabras, partidas } = stats;

  const totalAciertos = palabras.reduce((acc, p) => acc + p.aciertos, 0);
  const totalFallos = palabras.reduce((acc, p) => acc + p.fallos, 0);
  const total = totalAciertos + totalFallos;
  const accuracy = total > 0 ? Math.round((totalAciertos / total) * 100) : 0;

  // Chart Data: Global Accuracy
  const doughnutData = {
    labels: ['Aciertos', 'Fallos'],
    datasets: [
      {
        data: [totalAciertos, totalFallos],
        backgroundColor: ['rgba(74, 222, 128, 0.5)', 'rgba(248, 113, 113, 0.5)'],
        borderColor: ['#4ade80', '#f87171'],
        borderWidth: 1,
      },
    ],
  };

  // Chart Data: Activity over last 7 days (mock based on partidas date)
  // Group partidas by date
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const activityData = last7Days.map(date => {
    return partidas.filter(p => new Date(p.fecha).toISOString().split('T')[0] === date).length;
  });

  const lineData = {
    labels: last7Days.map(d => d.slice(5)), // MM-DD
    datasets: [
      {
        label: 'Partidas jugadas',
        data: activityData,
        borderColor: '#00f3ff',
        backgroundColor: 'rgba(0, 243, 255, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Estadísticas</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 text-center">
            <div className="text-gray-400 text-xs uppercase">Palabras</div>
            <div className="text-2xl font-bold">{palabras.length}</div>
        </div>
        <div className="glass-panel p-4 text-center">
            <div className="text-gray-400 text-xs uppercase">Partidas</div>
            <div className="text-2xl font-bold">{partidas.length}</div>
        </div>
        <div className="glass-panel p-4 text-center">
            <div className="text-gray-400 text-xs uppercase">Precisión</div>
            <div className={`text-2xl font-bold ${accuracy >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>{accuracy}%</div>
        </div>
        <div className="glass-panel p-4 text-center">
            <div className="text-gray-400 text-xs uppercase">Tiempo Total</div>
            <div className="text-2xl font-bold text-[var(--brand-secondary)]">
                {Math.round(partidas.reduce((acc, p) => acc + p.tiempoTotal, 0) / 60)} min
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass-panel p-6">
            <h3 className="mb-4 font-bold text-gray-300">Precisión Global</h3>
            <div className="h-64 flex justify-center">
                <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
            </div>
         </div>
         
         <div className="glass-panel p-6">
            <h3 className="mb-4 font-bold text-gray-300">Actividad (Últimos 7 días)</h3>
            <div className="h-64">
                <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
            </div>
         </div>
      </div>
    </div>
  );
}
