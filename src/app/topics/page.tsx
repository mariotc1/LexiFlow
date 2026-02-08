"use client";

import { useEffect, useState } from "react";
import { useTemaStore } from "@/stores";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TopicCard } from "@/components/TopicCard";
import { dbService } from "@/lib/db";

export default function TopicsPage() {
  const { temas, loadTemas, addTema, deleteTema, loading } = useTemaStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [wordCounts, setWordCounts] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTemas();
  }, [loadTemas]);

  useEffect(() => {
    const fetchCounts = async () => {
        const words = await dbService.getAllPalabras();
        const counts: Record<string, number> = {};
        words.forEach(w => {
            counts[w.idTema] = (counts[w.idTema] || 0) + 1;
        });
        setWordCounts(counts);
    };
    if (temas.length > 0) {
        fetchCounts();
    }
  }, [temas]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    await addTema(newTopicName);
    setNewTopicName("");
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (confirm("¿Seguro que quieres borrar este tema y todas sus palabras?")) {
      await deleteTema(id);
    }
  };

  const filteredTemas = temas.filter(t => 
      t.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 py-8">
        <div>
            <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex items-center gap-2 text-[var(--brand-primary)] uppercase tracking-widest font-bold text-xs mb-2"
           >
              <Database className="w-4 h-4" />
              TU BIBLIOTECA
           </motion.div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              MIS TEMAS
            </h1>
            <p className="text-gray-400 mt-2">
                Gestiona tus {temas.length} listas de vocabulario.
            </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[var(--brand-primary)] transition-colors" />
                <Input 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="Buscar tema..." 
                    className="pl-10 bg-black/30 border-white/10 focus:border-[var(--brand-primary)] rounded-xl"
                />
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="whitespace-nowrap shadow-[0_0_15px_-5px_var(--brand-primary)]">
              <Plus className="mr-2 h-4 w-4" /> CREAR TEMA
            </Button>
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-[var(--brand-primary)] animate-pulse">ACCEDIENDO A MEMORIA...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTemas.map((tema, index) => (
               <TopicCard 
                    key={tema.id}
                    index={index}
                    id={tema.id}
                    name={tema.nombre}
                    wordCount={wordCounts[tema.id] || 0}
                    onDelete={(e) => handleDelete(tema.id, e)}
               />
            ))}
          </AnimatePresence>
          
          {/* Add Button as a Card if empty or just at end? */}
          {/* Let's just keep the button in header to be clean. */}
          
          {filteredTemas.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-50">
               <Database className="w-16 h-16 text-gray-600 mb-4" />
               <p className="text-xl font-bold text-gray-500">No se encontraron datos.</p>
               <p className="text-gray-600">Inicia un nuevo protocolo de aprendizaje.</p>
            </div>
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="NUEVO TEMA"
      >
        <form onSubmit={handleCreateTopic} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--brand-primary)] tracking-widest mb-1">NOMBRE DEL TEMA</label>
            <Input
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Ej: Viajes, Comida..."
              autoFocus
              className="bg-black/50 border-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] text-lg"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              CANCELAR
            </Button>
            <Button type="submit" disabled={!newTopicName.trim()} className="bg-[var(--brand-primary)] text-black font-bold hover:bg-[var(--brand-primary)] hover:brightness-110">
              CREAR TEMA
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
