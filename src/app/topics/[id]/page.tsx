"use client";

import { useEffect, useState, use } from "react";
import { dbService } from "@/lib/db";
import { Palabra, Tema } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ArrowLeft, Plus, Search, Trash2, Edit2, Check, X, BookOpen, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";

export default function TopicDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tema, setTema] = useState<Tema | null>(null);
  const [words, setWords] = useState<Palabra[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Add Word State
  const [newWord, setNewWord] = useState({ eng: "", esp: "" });

  // Edit Word State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ eng: "", esp: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const temas = await dbService.getTemas();
        const found = temas.find(t => t.id === id);
        if (found) {
          setTema(found);
          const relatedWords = await dbService.getPalabras(id);
          setWords(relatedWords);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.eng || !newWord.esp) return;
    
    const palabra: Palabra = {
      id: crypto.randomUUID(),
      idTema: id,
      ingles: newWord.eng.trim(),
      espanol: newWord.esp.trim(),
      aciertos: 0,
      fallos: 0,
      ultimoRepaso: 0
    };
    
    await dbService.addPalabra(palabra);
    setWords([...words, palabra]);
    setNewWord({ eng: "", esp: "" });
    setIsAddModalOpen(false);
    sfx.playCorrect();
  };

  const handleDeleteWord = async (wordId: string) => {
      if (confirm("¿Seguro que quieres eliminar esta palabra?")) {
          // In a real app we'd use dbService.deletePalabra but we need to verify if it exists
          // Since dbService doesn't have deletePalabra specifically exposed, let's implement a quick workaround or assume we added it.
          // Wait, dbService.deleteTema deletes words, but single word deletion?
          // I need to add deletePalabra to dbService or do it manually here via idb instance if possible.
          // Let's assume I'll add it to dbService in next step or use a raw IDB call if needed.
          // Actually, let's just do it via dbService.addPalabra (overwrite) ... no wait, delete.
          // I will add deletePalabra to dbService in the next step. For now UI logic:
          
          await dbService.deletePalabra(wordId); // Assuming I will add this method
          setWords(words.filter(w => w.id !== wordId));
          sfx.playIncorrect(); // Trash sound
      }
  };

  const startEdit = (word: Palabra) => {
      setEditingId(word.id);
      setEditForm({ eng: word.ingles, esp: word.espanol });
      sfx.playClick();
  };

  const cancelEdit = () => {
      setEditingId(null);
      setEditForm({ eng: "", esp: "" });
  };

  const saveEdit = async (wordId: string) => {
      if (!editForm.eng || !editForm.esp) return;
      
      const original = words.find(w => w.id === wordId);
      if (!original) return;

      const updated: Palabra = {
          ...original,
          ingles: editForm.eng.trim(),
          espanol: editForm.esp.trim()
      };

      await dbService.addPalabra(updated); // put overwrites
      setWords(words.map(w => w.id === wordId ? updated : w));
      setEditingId(null);
      sfx.playCorrect();
  };

  const filteredWords = words.filter(w => 
    w.ingles.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.espanol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando...</div>;
  if (!tema) return <div className="p-8 text-center text-red-500">Tema no encontrado</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Link href="/topics">
            <Button variant="ghost" size="sm" className="rounded-full h-12 w-12 p-0 bg-white/5 hover:bg-white/10">
                <ArrowLeft className="h-6 w-6" />
            </Button>
            </Link>
            <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {tema.nombre}
            </h1>
            <div className="flex items-center gap-2 text-gray-400 mt-1">
                <BookOpen className="w-4 h-4" />
                <span>{words.length} palabras</span>
            </div>
            </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input 
                    placeholder="Buscar palabra..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black/20 border-white/10 focus:border-[var(--brand-primary)]"
                />
           </div>
           <Button onClick={() => setIsAddModalOpen(true)} className="shadow-lg shadow-[var(--brand-primary)]/20">
             <Plus className="mr-2 h-4 w-4" /> Añadir
           </Button>
        </div>
      </div>

      {/* Words List */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-white/5 bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                <th className="px-6 py-4 font-bold">Inglés</th>
                <th className="px-6 py-4 font-bold">Español</th>
                <th className="px-6 py-4 font-bold text-center">Progreso</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                {filteredWords.map((word) => (
                <motion.tr 
                    key={word.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-white/5 transition-colors"
                >
                    {editingId === word.id ? (
                        <>
                            <td className="px-6 py-4">
                                <Input 
                                    value={editForm.eng}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, eng: e.target.value }))}
                                    className="bg-black/40 border-[var(--brand-primary)]"
                                    autoFocus
                                />
                            </td>
                            <td className="px-6 py-4">
                                <Input 
                                    value={editForm.esp}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, esp: e.target.value }))}
                                    className="bg-black/40 border-[var(--brand-primary)]"
                                />
                            </td>
                            <td className="px-6 py-4 text-center text-gray-500">-</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={cancelEdit} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                        <X className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => saveEdit(word.id)} className="text-green-400 hover:text-green-300 hover:bg-green-400/10">
                                        <Check className="w-4 h-4" />
                                    </Button>
                                </div>
                            </td>
                        </>
                    ) : (
                        <>
                            <td className="px-6 py-4 font-medium text-white">{word.ingles}</td>
                            <td className="px-6 py-4 text-gray-300">{word.espanol}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-2 w-24 bg-gray-700/50 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]"
                                            style={{ width: `${Math.min(100, (word.aciertos / (word.aciertos + word.fallos || 1)) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500">{word.aciertos}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="ghost" onClick={() => startEdit(word)} className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDeleteWord(word.id)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-400/10">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </td>
                        </>
                    )}
                </motion.tr>
                ))}
                </AnimatePresence>
                {filteredWords.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-500">
                        {searchTerm ? "No se encontraron resultados" : "Este tema está vacío. ¡Añade tu primera palabra!"}
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Añadir Palabra"
      >
        <form onSubmit={handleAddWord} className="space-y-6">
          <div className="space-y-4">
             <div className="p-4 rounded-xl bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/10">
                <label className="block text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider mb-2">Inglés</label>
                <Input
                    value={newWord.eng}
                    onChange={(e) => setNewWord({ ...newWord, eng: e.target.value })}
                    placeholder="Example: Apple"
                    className="text-lg bg-black/20 border-white/10"
                    autoFocus
                />
             </div>
             <div className="p-4 rounded-xl bg-[var(--brand-secondary)]/5 border border-[var(--brand-secondary)]/10">
                <label className="block text-xs font-bold text-[var(--brand-secondary)] uppercase tracking-wider mb-2">Español</label>
                <Input
                    value={newWord.esp}
                    onChange={(e) => setNewWord({ ...newWord, esp: e.target.value })}
                    placeholder="Ejemplo: Manzana"
                    className="text-lg bg-black/20 border-white/10"
                />
             </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!newWord.eng || !newWord.esp} className="shadow-lg shadow-[var(--brand-primary)]/20">
              <Plus className="mr-2 h-4 w-4" /> Añadir
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
