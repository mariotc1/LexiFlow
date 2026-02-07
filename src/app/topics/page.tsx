"use client";

import { useEffect, useState } from "react";
import { useTemaStore } from "@/stores";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2, Folder } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function TopicsPage() {
  const { temas, loadTemas, addTema, deleteTema, loading } = useTemaStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");

  useEffect(() => {
    loadTemas();
  }, [loadTemas]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    await addTema(newTopicName);
    setNewTopicName("");
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    if (confirm("Are you sure? This will delete all words in this topic.")) {
      await deleteTema(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Mis Temas
        </h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Tema
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando temas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {temas.map((tema) => (
              <Link href={`/topics/${tema.id}`} key={tema.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  className="glass-panel p-6 group cursor-pointer border border-white/5 hover:border-[var(--brand-primary)]/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] group-hover:bg-[var(--brand-primary)] group-hover:text-black transition-colors">
                      <Folder className="h-6 w-6" />
                    </div>
                    <button
                      onClick={(e) => handleDelete(tema.id, e)}
                      className="text-gray-500 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[var(--brand-primary)] transition-colors">
                    {tema.nombre}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {new Date(tema.fechaCreacion).toLocaleDateString()}
                  </p>
                </motion.div>
              </Link>
            ))}
          </AnimatePresence>
          
          {temas.length === 0 && (
            <div className="col-span-full text-center py-20 glass rounded-2xl border-dashed border-2 border-white/10">
              <p className="text-gray-400 mb-4">No tienes temas creados aún.</p>
              <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                Crear mi primer tema
              </Button>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Tema"
      >
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nombre del Tema</label>
            <Input
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Ej: Verbos Irregulares"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!newTopicName.trim()}>
              Crear Tema
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
