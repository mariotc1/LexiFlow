"use client";

import { useEffect, useState, use } from "react";
import { dbService } from "@/lib/db";
import { useTemaStore } from "@/stores";
import { Palabra, Tema } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ArrowLeft, Plus, Search, Mic } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function TopicDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tema, setTema] = useState<Tema | null>(null);
  const [words, setWords] = useState<Palabra[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Use separate state for new word input
  const [newWord, setNewWord] = useState({ eng: "", esp: "" });

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
      ingles: newWord.eng,
      espanol: newWord.esp,
      aciertos: 0,
      fallos: 0,
      ultimoRepaso: 0
    };
    
    await dbService.addPalabra(palabra);
    setWords([...words, palabra]);
    setNewWord({ eng: "", esp: "" });
    setIsAddModalOpen(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  if (!tema) return <div className="p-8 text-center text-red-500">Tema no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/topics">
          <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{tema.nombre}</h1>
          <p className="text-gray-400 text-sm">{words.length} palabras</p>
        </div>
        <div className="ml-auto flex gap-2">
           <Link href="/import">
             <Button variant="secondary" size="sm">
               Importar Masivo
             </Button>
           </Link>
           <Button onClick={() => setIsAddModalOpen(true)} size="sm">
             <Plus className="mr-2 h-4 w-4" /> Añadir Palabra
           </Button>
        </div>
      </div>

      {/* Word List */}
      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Inglés</th>
              <th className="px-6 py-4 font-medium">Español</th>
              <th className="px-6 py-4 font-medium text-right">Aciertos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {words.map((word) => (
              <motion.tr 
                key={word.id} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                layout
                className="hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-4 font-medium">{word.ingles}</td>
                <td className="px-6 py-4 text-gray-300">{word.espanol}</td>
                <td className="px-6 py-4 text-right">
                  <span className={word.aciertos > word.fallos ? "text-green-400" : "text-gray-500"}>
                    {word.aciertos} / {word.aciertos + word.fallos}
                  </span>
                </td>
              </motion.tr>
            ))}
            {words.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                  No hay palabras en este tema. Añade algunas para empezar a practicar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Añadir Palabra"
      >
        <form onSubmit={handleAddWord} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Inglés</label>
              <Input
                value={newWord.eng}
                onChange={(e) => setNewWord({ ...newWord, eng: e.target.value })}
                placeholder="Hello"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Español</label>
              <Input
                value={newWord.esp}
                onChange={(e) => setNewWord({ ...newWord, esp: e.target.value })}
                placeholder="Hola"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!newWord.eng || !newWord.esp}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
