"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTemaStore } from "@/stores";
import { parseTextContent, performOCR, ParsedWord, parseTxtFile } from "@/lib/import";
import { dbService } from "@/lib/db";
import { useRouter } from "next/navigation";
import { Upload, FileText, Type, Image as ImageIcon, Loader2, ArrowRight, Check, X, Sparkles, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";

type ImportMode = 'paste' | 'file' | 'ocr' | null;
type Step = 'selection' | 'input' | 'review';

export default function ImportPage() {
  const [step, setStep] = useState<Step>('selection');
  const [mode, setMode] = useState<ImportMode>(null);
  
  const [targetTopicName, setTargetTopicName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [words, setWords] = useState<ParsedWord[]>([]);
  const [textInput, setTextInput] = useState("");
  
  const router = useRouter();
  const { addTema } = useTemaStore();

  // --- Actions ---

  const selectMode = (m: ImportMode) => {
    setMode(m);
    setStep('input');
    sfx.playClick();
  };

  const goBack = () => {
    sfx.playClick();
    if (step === 'review') {
        // If we have words, warn? Nah, just keep them for now or clear?
        // Let's keep words but go back to input
        setStep('input');
    } else if (step === 'input') {
        setStep('selection');
        setMode(null);
    }
  };

  const handleProcess = async () => {
    if (mode === 'paste' && textInput.trim()) {
      const parsed = parseTextContent(textInput);
      if (parsed.length > 0) {
          setWords(prev => [...prev, ...parsed]);
          setTextInput("");
          sfx.playCorrect();
          setStep('review');
      } else {
          sfx.playIncorrect();
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      let parsed: ParsedWord[] = [];
      if (mode === 'file') {
        parsed = await parseTxtFile(file);
      } else if (mode === 'ocr') {
        const text = await performOCR(file, (p) => setProgress(Math.round(p * 100)));
        parsed = parseTextContent(text);
      }
      
      if (parsed.length > 0) {
          setWords(prev => [...prev, ...parsed]);
          sfx.playCorrect();
          setStep('review');
      } else {
          alert("No se encontraron palabras.");
          sfx.playIncorrect();
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
      sfx.playWin();
      router.push(`/topics/${topicId}`);
    } catch (error) {
      console.error(error);
      sfx.playIncorrect();
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  // --- Variants ---
  const containerVars = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="max-w-7xl mx-auto min-h-[90vh] flex flex-col pt-4 pb-12">
      {/* Header / Nav */}
      <div className="flex items-center justify-between mb-8 px-4">
         <div className="flex items-center gap-4">
            {step !== 'selection' && (
                <Button variant="ghost" onClick={goBack} className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-white/5 hover:bg-white/10">
                    <ChevronLeft className="w-6 h-6" />
                </Button>
            )}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    {step === 'selection' && "Nueva Colección"}
                    {step === 'input' && (mode === 'paste' ? "Pegar Texto" : mode === 'file' ? "Subir Archivo" : "Escanear Cámara")}
                    {step === 'review' && "Revisar y Guardar"}
                </h1>
                <p className="text-gray-400">
                    {step === 'selection' && "Selecciona cómo quieres importar tus palabras."}
                    {step === 'input' && "Procesa tu contenido para extraer vocabulario."}
                    {step === 'review' && `Se han detectado ${words.length} palabras.`}
                </p>
            </div>
         </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'selection' && (
            <motion.div 
                key="selection"
                variants={containerVars}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1"
            >
                {/* BIG CARD 1: PASTE */}
                <div 
                    onClick={() => selectMode('paste')}
                    className="group glass-panel h-[60vh] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden text-center p-8 hover:bg-white/5"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-32 h-32 rounded-full bg-blue-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                        <Type className="w-16 h-16 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Pegar Texto</h2>
                    <p className="text-gray-400 max-w-xs text-lg">Copia desde cualquier lugar y pega aquí. Detectamos el formato automáticamente.</p>
                </div>

                {/* BIG CARD 2: FILE */}
                <div 
                    onClick={() => selectMode('file')}
                    className="group glass-panel h-[60vh] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden text-center p-8 hover:bg-white/5"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-32 h-32 rounded-full bg-purple-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-16 h-16 text-purple-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Subir Archivo</h2>
                    <p className="text-gray-400 max-w-xs text-lg">Importa listas largas desde archivos .txt.</p>
                </div>

                 {/* BIG CARD 3: OCR */}
                 <div 
                    onClick={() => selectMode('ocr')}
                    className="group glass-panel h-[60vh] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden text-center p-8 hover:bg-white/5"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-32 h-32 rounded-full bg-pink-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                        <Sparkles className="w-16 h-16 text-pink-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Escanear Foto</h2>
                    <p className="text-gray-400 max-w-xs text-lg">Usa Visión por Computadora para extraer palabras de fotos de libros.</p>
                </div>
            </motion.div>
        )}

        {step === 'input' && (
            <motion.div 
                key="input"
                variants={containerVars}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex-1 flex max-w-4xl mx-auto w-full"
            >
                <div className="glass-panel w-full p-10 flex flex-col">
                    {mode === 'paste' ? (
                        <div className="flex flex-col h-full gap-6">
                            <textarea
                                className="flex-1 w-full bg-black/30 rounded-2xl p-6 text-xl text-white placeholder:text-gray-600 border border-white/5 focus:border-[var(--brand-primary)] focus:outline-none resize-none font-mono leading-relaxed transition-colors"
                                placeholder={`English = Spanish\nHello = Hola\n...`}
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end">
                                <Button size="lg" onClick={handleProcess} disabled={!textInput.trim()} className="px-12 py-6 text-lg">
                                    Procesar <ArrowRight className="ml-3 w-6 h-6" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full gap-8">
                             {loading ? (
                                <div className="text-center">
                                    <div className="w-24 h-24 rounded-full border-4 border-white/10 border-t-[var(--brand-primary)] animate-spin mx-auto mb-6" />
                                    <h3 className="text-2xl font-bold animate-pulse">Analizando... {progress}%</h3>
                                </div>
                             ) : (
                                <label className="w-full h-96 border-4 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer group">
                                    <input type="file" className="hidden" accept={mode === 'ocr' ? "image/*" : ".txt"} onChange={handleFileChange} />
                                    <div className="p-8 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] mb-6 group-hover:scale-110 transition-transform">
                                        <Upload className="w-16 h-16" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2">Haz clic para subir</h3>
                                    <p className="text-xl text-gray-500">
                                        {mode === 'ocr' ? "JPG, PNG, WEBP" : "Archivos de texto (.txt)"}
                                    </p>
                                </label>
                             )}
                         </div>
                    )}
                </div>
            </motion.div>
        )}

        {step === 'review' && (
             <motion.div 
                key="review"
                variants={containerVars}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[70vh]"
            >
                {/* Word List Area */}
                <div className="lg:col-span-8 glass-panel overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/5 bg-black/20 flex justify-between items-center">
                         <h3 className="text-xl font-bold">Palabras Detectadas</h3>
                         <span className="bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] px-3 py-1 rounded-full text-xs font-bold">
                             {words.length} items
                         </span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                         <div className="space-y-2">
                             {words.map((w, idx) => (
                                 <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group">
                                     <div className="text-gray-500 font-mono w-8 text-center">{idx + 1}</div>
                                     <div className="flex-1 grid grid-cols-2 gap-4">
                                         <div className="font-bold text-lg text-white">{w.eng}</div>
                                         <div className="text-gray-300 text-lg">{w.esp}</div>
                                     </div>
                                     <button 
                                        onClick={() => setWords(words.filter((_, i) => i !== idx))}
                                        className="p-2 opacity-50 group-hover:opacity-100 text-red-400 hover:bg-red-400/20 rounded-lg transition-all"
                                     >
                                        <X className="w-5 h-5" />
                                     </button>
                                 </div>
                             ))}
                             {words.length === 0 && (
                                 <div className="p-12 text-center text-gray-500">No hay palabras en la lista.</div>
                             )}
                         </div>
                    </div>
                </div>

                {/* Sidebar Save Area */}
                <div className="lg:col-span-4 glass-panel p-8 flex flex-col gap-6 h-fit sticky top-4">
                     <div>
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 block">Nombre de la Colección</label>
                        <Input 
                            value={targetTopicName}
                            onChange={(e) => setTargetTopicName(e.target.value)}
                            placeholder="Ej: Viaje a Londres"
                            className="bg-black/30 border-white/10 h-14 text-lg focus:border-[var(--brand-primary)]"
                        />
                     </div>
                     
                     <div className="p-4 rounded-xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20">
                         <h4 className="font-bold text-[var(--brand-primary)] mb-2 flex items-center gap-2">
                             <Sparkles className="w-4 h-4" /> Resumen
                         </h4>
                         <p className="text-sm text-gray-300">
                             Se crearán <strong>{words.length}</strong> tarjetas nuevas. 
                             Podrás repasarlas inmediatamente en el modo de juego.
                         </p>
                     </div>

                     <div className="mt-auto pt-4">
                        <Button 
                            className="w-full h-16 text-xl font-bold shadow-2xl shadow-[var(--brand-primary)]/20"
                            onClick={handleSave}
                            disabled={!targetTopicName || words.length === 0}
                            isLoading={loading}
                        >
                            Guardar Colección
                        </Button>
                        <Button variant="ghost" className="w-full mt-4" onClick={() => setStep('input')}>
                            Volver y Añadir Más
                        </Button>
                     </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
