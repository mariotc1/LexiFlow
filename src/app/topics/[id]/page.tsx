"use client";

import { useEffect, useState, use } from "react";
import { dbService } from "@/lib/db";
import { Palabra, Tema } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ArrowLeft, Plus, Search, Trash2, Edit2, Check, X, BookOpen, MoreVertical, Terminal, Database } from "lucide-react";
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
      if (confirm("¿Confirmar eliminación de registro?")) {
          await dbService.deletePalabra(wordId);
          setWords(words.filter(w => w.id !== wordId));
          sfx.playIncorrect(); 
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

  if (loading) return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Terminal className="w-12 h-12 text-[var(--brand-primary)] animate-pulse" />
          <div className="font-mono text-[var(--brand-primary)]">ACCEDIENDO A ARCHIVOS...</div>
      </div>
  );
  
  if (!tema) return <div className="p-8 text-center text-red-500 font-mono">ERROR 404: ARCHIVO CORRUPTO O NO ENCONTRADO</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
            <Link href="/topics">
            <Button variant="ghost" size="sm" className="rounded-full h-12 w-12 p-0 bg-white/5 hover:bg-white/10 hover:text-[var(--brand-primary)]">
                <ArrowLeft className="h-6 w-6" />
            </Button>
            </Link>
            <div>
                 <div className="flex items-center gap-2 text-[var(--brand-primary)] uppercase tracking-widest font-bold text-xs mb-1">
                    <Database className="w-4 h-4" />
                    BASE DE CONOCIMIENTO
                 </div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                    {tema.nombre}
                </h1>
                <div className="flex items-center gap-2 text-gray-400 mt-2 font-mono text-sm">
                    <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{words.length} REGISTROS</span>
                </div>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-72 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[var(--brand-primary)] transition-colors" />
                <Input 
                    placeholder="FILTRAR DATOS..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 bg-black/40 border-white/10 focus:border-[var(--brand-primary)] h-12 font-mono text-sm uppercase tracking-wider"
                />
           </div>
           <Button onClick={() => setIsAddModalOpen(true)} className="h-12 shadow-[0_0_15px_-5px_var(--brand-primary)] bg-[var(--brand-primary)] text-black border-none font-bold uppercase tracking-wider">
             <Plus className="mr-2 h-4 w-4" /> NUEVA ENTRADA
           </Button>
        </div>
      </div>

      {/* Words List - Data Matrix Style */}
      <div className="bg-black/20 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
         {/* Table Header Row */}
         <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs font-bold text-gray-500 uppercase tracking-widest">
             <div className="col-span-1 text-center">ID</div>
             <div className="col-span-4 md:col-span-3">Concepto (EN)</div>
             <div className="col-span-4 md:col-span-3">Traducción (ES)</div>
             <div className="col-span-3 md:col-span-3 text-center hidden md:block">Integridad</div>
             <div className="col-span-3 md:col-span-2 text-right">Acciones</div>
         </div>

         <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2 space-y-1">
            <AnimatePresence>
                {filteredWords.map((word, idx) => (
                    <motion.div 
                        key={word.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="grid grid-cols-12 gap-4 p-4 items-center rounded-xl hover:bg-white/5 transition-colors group relative border border-transparent hover:border-white/5"
                    >
                         {/* Hover Glow */}
                         <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />

                         {/* ID */}
                         <div className="col-span-1 text-center font-mono text-xs text-gray-600 group-hover:text-[var(--brand-primary)] transition-colors">
                             {String(idx + 1).padStart(2, '0')}
                         </div>

                         {editingId === word.id ? (
                            <>
                                <div className="col-span-4 md:col-span-3">
                                    <Input 
                                        value={editForm.eng} 
                                        onChange={(e) => setEditForm(prev => ({ ...prev, eng: e.target.value }))}
                                        className="h-8 bg-black/50 border-[var(--brand-primary)] text-white font-mono"
                                        autoFocus
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-3">
                                    <Input 
                                        value={editForm.esp} 
                                        onChange={(e) => setEditForm(prev => ({ ...prev, esp: e.target.value }))}
                                        className="h-8 bg-black/50 border-[var(--brand-primary)] text-white font-mono"
                                    />
                                </div>
                                <div className="col-span-3 md:col-span-5 flex justify-end gap-2">
                                     <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"><X className="w-4 h-4" /></Button>
                                     <Button size="sm" variant="ghost" onClick={() => saveEdit(word.id)} className="h-8 w-8 p-0 text-green-500 hover:bg-green-500/10"><Check className="w-4 h-4" /></Button>
                                </div>
                            </>
                         ) : (
                             <>
                                <div className="col-span-4 md:col-span-3 font-bold text-white text-lg">{word.ingles}</div>
                                <div className="col-span-4 md:col-span-3 text-gray-400">{word.espanol}</div>
                                
                                <div className="col-span-3 md:col-span-3 hidden md:flex items-center justify-center gap-3">
                                    <div className="h-1.5 w-24 bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${word.fallos > word.aciertos ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-[var(--brand-primary)] shadow-[0_0_5px_var(--brand-primary)]'}`}
                                            style={{ width: `${Math.min(100, (word.aciertos / (word.aciertos + word.fallos || 1)) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-500 w-8 text-right">
                                        {Math.round((word.aciertos / (word.aciertos + word.fallos || 1)) * 100)}%
                                    </span>
                                </div>

                                <div className="col-span-3 md:col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="ghost" onClick={() => startEdit(word)} className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDeleteWord(word.id)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-500/10">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                             </>
                         )}
                    </motion.div>
                ))}
            </AnimatePresence>
            
            {filteredWords.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center justify-center text-gray-500">
                     <Terminal className="w-12 h-12 mb-4 opacity-20" />
                     <p className="font-mono uppercase tracking-widest text-sm">NO SE ENCONTRARON DATOS</p>
                </div>
            )}
         </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="NUEVA ENTRADA DE DATOS"
      >
        <form onSubmit={handleAddWord} className="space-y-6">
          <div className="space-y-4">
             <div className="p-4 rounded-xl bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/10 group focus-within:border-[var(--brand-primary)]/50 transition-colors">
                <label className="block text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider mb-2 group-focus-within:text-white transition-colors">Inglés (Concepto)</label>
                <Input
                    value={newWord.eng}
                    onChange={(e) => setNewWord({ ...newWord, eng: e.target.value })}
                    placeholder="Ej: Neural Network"
                    className="text-lg bg-black/20 border-white/10 font-mono"
                    autoFocus
                />
             </div>
             <div className="p-4 rounded-xl bg-[var(--brand-secondary)]/5 border border-[var(--brand-secondary)]/10 group focus-within:border-[var(--brand-secondary)]/50 transition-colors">
                <label className="block text-xs font-bold text-[var(--brand-secondary)] uppercase tracking-wider mb-2 group-focus-within:text-white transition-colors">Español (Traducción)</label>
                <Input
                    value={newWord.esp}
                    onChange={(e) => setNewWord({ ...newWord, esp: e.target.value })}
                    placeholder="Ej: Red Neuronal"
                    className="text-lg bg-black/20 border-white/10 font-mono"
                />
             </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              CANCELAR
            </Button>
            <Button type="submit" disabled={!newWord.eng || !newWord.esp} className="shadow-lg shadow-[var(--brand-primary)]/20 bg-[var(--brand-primary)] text-black font-bold uppercase tracking-wider">
              <Plus className="mr-2 h-4 w-4" /> REGISTRAR
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
