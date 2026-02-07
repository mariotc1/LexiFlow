"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTemaStore } from "@/stores";
import { parseTextContent, performOCR, ParsedWord, parseTxtFile } from "@/lib/import";
import { dbService } from "@/lib/db";
import { useRouter } from "next/navigation";
import { Upload, FileText, Type, Image as ImageIcon, Loader2, ArrowRight, Check, X, Sparkles, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";

type ImportMode = 'manual' | 'paste' | 'file' | 'ocr' | null;

export default function ImportPage() {
  const [mode, setMode] = useState<ImportMode>(null);
  const [targetTopicName, setTargetTopicName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [words, setWords] = useState<ParsedWord[]>([]);
  const [textInput, setTextInput] = useState("");
  
  const router = useRouter();
  const { addTema } = useTemaStore();

  const handleProcess = async () => {
    if (mode === 'paste') {
      const parsed = parseTextContent(textInput);
      setWords(prev => [...prev, ...parsed]);
      setTextInput("");
      sfx.playCorrect();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      if (mode === 'file') {
        const parsed = await parseTxtFile(file);
        setWords(prev => [...prev, ...parsed]);
        sfx.playCorrect();
      } else if (mode === 'ocr') {
        const text = await performOCR(file, (p) => setProgress(Math.round(p * 100)));
        const parsed = parseTextContent(text);
        setWords(prev => [...prev, ...parsed]);
        sfx.playCorrect();
      }
    } catch (err) {
      console.error(err);
      sfx.playIncorrect();
      alert("Error processing file");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleSave = async () => {
    if (!targetTopicName || words.length === 0) return;
    
    setLoading(true);
    try {
      sfx.playClick();
      const topicId = await addTema(targetTopicName);
      
      const promises = words.map(w => 
        dbService.addPalabra({
          id: crypto.randomUUID(),
          idTema: topicId,
          ingles: w.eng,
          espanol: w.esp,
          aciertos: 0,
          fallos: 0,
          ultimoRepaso: 0
        })
      );
      
      await Promise.all(promises);
      sfx.playWin(); // Celebrate new topic
      router.push(`/topics/${topicId}`);
    } catch (error) {
      console.error(error);
      sfx.playIncorrect();
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
      setWords([]);
      setMode(null);
      setTextInput("");
      setTargetTopicName("");
      sfx.playClick();
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 min-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                Importar Contenido
            </h1>
            <p className="text-lg text-gray-400">Elige cómo quieres añadir nuevo vocabulario a tu colección.</p>
         </div>
         {mode && (
             <Button variant="ghost" onClick={clearAll} className="text-gray-400 hover:text-white">
                 <X className="mr-2 h-4 w-4" /> Cancelar
             </Button>
         )}
      </div>

      <AnimatePresence mode="wait">
        {!mode ? (
            /* Mode Selection Grid */
            <motion.div 
                key="selection"
                variants={container}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1"
            >
                {[
                    { id: 'paste', title: 'Pegar Texto', icon: Type, desc: 'Copia y pega tu lista de palabras.', color: 'from-blue-500/20 to-blue-600/5', border: 'hover:border-blue-500/50', iconColor: 'text-blue-400' },
                    { id: 'file', title: 'Subir Archivo', icon: FileText, desc: 'Importa desde un archivo .txt', color: 'from-purple-500/20 to-purple-600/5', border: 'hover:border-purple-500/50', iconColor: 'text-purple-400' },
                    { id: 'ocr', title: 'Escanear Foto', icon: Sparkles, desc: 'Usa IA para leer fotos de libros.', color: 'from-pink-500/20 to-pink-600/5', border: 'hover:border-pink-500/50', iconColor: 'text-pink-400' },
                ].map((m) => (
                    <motion.div
                        key={m.id}
                        variants={item}
                        onClick={() => { setMode(m.id as ImportMode); sfx.playClick(); }}
                        className={`glass-panel p-8 cursor-pointer group relative overflow-hidden transition-all duration-300 border border-white/5 ${m.border}`}
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className={`p-4 rounded-2xl bg-white/5 w-fit mb-6 group-hover:bg-white/10 transition-colors ${m.iconColor}`}>
                                    <m.icon className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">{m.title}</h3>
                                <p className="text-gray-400">{m.desc}</p>
                            </div>
                            <div className="mt-8 flex items-center text-sm font-bold text-gray-500 group-hover:text-white transition-colors">
                                Seleccionar <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        ) : (
            /* Workflow Area */
            <motion.div
                key="workflow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1"
            >
                {/* Left Panel: Input */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="glass-panel p-8 flex-1 flex flex-col">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-sm">1</span>
                            {mode === 'paste' ? 'Ingresa tus palabras' : mode === 'file' ? 'Sube tu archivo' : 'Sube tu imagen'}
                        </h2>
                        
                        {mode === 'paste' && (
                            <div className="flex-1 flex flex-col gap-4">
                                <textarea
                                    className="flex-1 w-full bg-black/20 rounded-xl p-4 text-white placeholder:text-gray-500 border border-white/10 focus:border-[var(--brand-primary)] focus:outline-none resize-none font-mono text-sm leading-relaxed"
                                    placeholder={`Ejemplo:\nDog = Perro\nCat = Gato\nBook : Libro`}
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    autoFocus
                                />
                                <Button onClick={handleProcess} disabled={!textInput.trim()} className="w-full">
                                    Procesar <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        {(mode === 'file' || mode === 'ocr') && (
                            <div className="flex-1 border-2 border-dashed border-white/10 rounded-2xl hover:border-[var(--brand-primary)]/50 hover:bg-[var(--brand-primary)]/5 transition-all flex flex-col items-center justify-center p-12 text-center">
                                {loading ? (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[var(--brand-primary)] animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center font-bold text-xs">{progress}%</div>
                                        </div>
                                        <p className="text-gray-300 animate-pulse">Analizando contenido...</p>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            accept={mode === 'ocr' ? "image/*" : ".txt"}
                                            onChange={handleFileChange}
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                            <div className="p-6 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] mb-4">
                                                {mode === 'ocr' ? <ImageIcon className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
                                            </div>
                                            <p className="text-xl font-bold text-white mb-2">Haz clic para subir</p>
                                            <p className="text-gray-400 text-sm max-w-xs mx-auto">
                                                {mode === 'ocr' ? 'Soporta imágenes JPG, PNG. Asegúrate de que el texto sea legible.' : 'Soporta archivos de texto (.txt) con formato UTF-8.'}
                                            </p>
                                        </label>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Preview & Save */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="glass-panel p-8 flex-1 flex flex-col h-full bg-black/40">
                         <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-sm">2</span>
                            Revisar y Guardar
                        </h2>
                        
                        <div className="mb-6">
                            <label className="text-sm font-medium text-gray-400 mb-2 block">Nombre del Tema</label>
                            <Input 
                                placeholder="Ej: Unit 1 - Travel" 
                                value={targetTopicName}
                                onChange={(e) => setTargetTopicName(e.target.value)}
                                className="bg-white/5 border-white/10 focus:border-[var(--brand-primary)]"
                            />
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col bg-white/5 rounded-xl border border-white/5">
                            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Palabras ({words.length})</span>
                                {words.length > 0 && <span className="text-xs text-[var(--brand-primary)]">Detectadas</span>}
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                                <AnimatePresence initial={false}>
                                    {words.map((w, idx) => (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="group flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-[var(--brand-secondary)]/20 text-[var(--brand-secondary)] flex items-center justify-center text-xs font-bold">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-white truncate">{w.eng}</div>
                                                <div className="text-xs text-gray-400 truncate">{w.esp}</div>
                                            </div>
                                            <button 
                                                onClick={() => setWords(words.filter((_, i) => i !== idx))}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {words.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center opacity-50">
                                        <BookOpen className="w-12 h-12 mb-4" />
                                        <p className="text-sm">Las palabras aparecerán aquí</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <Button 
                                variant="primary" 
                                className="w-full shadow-lg shadow-[var(--brand-primary)]/20"
                                disabled={words.length === 0 || !targetTopicName}
                                onClick={handleSave}
                                isLoading={loading}
                            >
                                <Check className="mr-2 h-4 w-4" /> Guardar Todo
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
