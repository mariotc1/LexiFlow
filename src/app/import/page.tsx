"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTemaStore } from "@/stores";
import { parseTextContent, performOCR, ParsedWord, parseTxtFile } from "@/lib/import";
import { dbService } from "@/lib/db";
import { useRouter } from "next/navigation";
import { Upload, FileText, Type, Image as ImageIcon, Loader2, ArrowRight, Check, X, Sparkles, ChevronLeft, ScanLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";
import { NeonCard } from "@/components/ui/NeonCard";

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
      <div className="flex items-center justify-between mb-8 px-4 border-b border-white/5 pb-6">
         <div className="flex items-center gap-4">
            {step !== 'selection' && (
                <Button variant="ghost" onClick={goBack} className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-white/5 hover:bg-white/10 hover:text-[var(--brand-primary)]">
                    <ChevronLeft className="w-6 h-6" />
                </Button>
            )}
            <div>
                 <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-[var(--brand-primary)] uppercase tracking-widest font-bold text-xs mb-1"
                >
                    <ScanLine className="w-4 h-4 animate-pulse" />
                    INGESTA DE DATOS
                </motion.div>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                    {step === 'selection' && "Fuente de Datos"}
                    {step === 'input' && (mode === 'paste' ? "Entrada Manual" : mode === 'file' ? "Subir Archivo" : "Escaneo Óptico")}
                    {step === 'review' && "Verificación de Datos"}
                </h1>
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
                <NeonCard 
                    color="primary"
                    delay={0}
                    onClick={() => selectMode('paste')}
                    className="flex flex-col items-center justify-center text-center p-8 h-[50vh] hover:cursor-pointer"
                >
                    <div className="w-24 h-24 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-[var(--brand-primary)]/20 shadow-[0_0_20px_-5px_var(--brand-primary)]">
                        <Type className="w-10 h-10 text-[var(--brand-primary)]" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Texto Directo</h2>
                    <p className="text-gray-400 max-w-xs">Pegar contenido desde el portapapeles. Detección automática de formato.</p>
                </NeonCard>

                {/* BIG CARD 2: FILE */}
                <NeonCard 
                     color="secondary"
                     delay={0.1}
                    onClick={() => selectMode('file')}
                    className="flex flex-col items-center justify-center text-center p-8 h-[50vh] hover:cursor-pointer"
                >
                    <div className="w-24 h-24 rounded-full bg-[var(--brand-secondary)]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-[var(--brand-secondary)]/20 shadow-[0_0_20px_-5px_var(--brand-secondary)]">
                        <FileText className="w-10 h-10 text-[var(--brand-secondary)]" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Archivo TXT</h2>
                    <p className="text-gray-400 max-w-xs">Importación masiva desde archivos de texto plano.</p>
                </NeonCard>

                 {/* BIG CARD 3: OCR */}
                 <NeonCard 
                     color="warning"
                     delay={0.2}
                    onClick={() => selectMode('ocr')}
                    className="flex flex-col items-center justify-center text-center p-8 h-[50vh] hover:cursor-pointer"
                >
                    <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-orange-500/20 shadow-[0_0_20px_-5px_orange]">
                        <ScanLine className="w-10 h-10 text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Escáner OCR</h2>
                    <p className="text-gray-400 max-w-xs">Extracción de texto mediante visión artificial (Beta).</p>
                </NeonCard>
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
                <div className="w-full relative">
                     {/* Decorative Borders */}
                     <div className="absolute -inset-1 bg-gradient-to-r from-[var(--brand-primary)]/20 to-[var(--brand-secondary)]/20 rounded-3xl blur opacity-50" />
                     
                    <div className="relative bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 h-full flex flex-col shadow-2xl">
                        {mode === 'paste' ? (
                            <div className="flex flex-col h-full gap-6">
                                <textarea
                                    className="flex-1 w-full bg-black/50 rounded-xl p-6 text-xl text-white placeholder:text-gray-600 border border-white/10 focus:border-[var(--brand-primary)] focus:outline-none resize-none font-mono leading-relaxed transition-colors custom-scrollbar"
                                    placeholder={`English = Spanish\nHello = Hola\n...`}
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex justify-end">
                                    <Button size="lg" onClick={handleProcess} disabled={!textInput.trim()} className="px-12 py-6 text-lg tracking-widest font-black shadow-[0_0_20px_-5px_var(--brand-primary)]">
                                        PROCESAR <ArrowRight className="ml-3 w-6 h-6" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full gap-8">
                                 {loading ? (
                                    <div className="text-center">
                                        <div className="relative w-32 h-32 mx-auto mb-6">
                                            <div className="absolute inset-0 border-4 border-[var(--brand-primary)]/30 rounded-full animate-ping" />
                                            <div className="absolute inset-0 border-4 border-t-[var(--brand-primary)] border-r-transparent border-b-[var(--brand-primary)] border-l-transparent rounded-full animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center text-[var(--brand-primary)] font-bold">
                                                {progress}%
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold animate-pulse text-[var(--brand-primary)] uppercase tracking-widest">Analizando Datos...</h3>
                                    </div>
                                 ) : (
                                    <label className="w-full h-96 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center hover:bg-white/5 hover:border-[var(--brand-primary)]/50 transition-all cursor-pointer group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />
                                        <input type="file" className="hidden" accept={mode === 'ocr' ? "image/*" : ".txt"} onChange={handleFileChange} />
                                        <div className="p-8 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_-5px_var(--brand-primary)]">
                                            {mode === 'ocr' ? <ScanLine className="w-16 h-16" /> : <Upload className="w-16 h-16" />}
                                        </div>
                                        <h3 className="text-3xl font-black text-white mb-2 uppercase">Subir Archivo</h3>
                                        <p className="text-xl text-gray-500 font-mono">
                                            {mode === 'ocr' ? "JPG, PNG, WEBP" : "Archivos .TXT"}
                                        </p>
                                    </label>
                                 )}
                             </div>
                        )}
                    </div>
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
                <div className="lg:col-span-8 bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-xl">
                    <div className="p-6 border-b border-white/10 bg-black/40 flex justify-between items-center">
                         <h3 className="text-lg font-bold uppercase tracking-wider text-gray-300">Datos Detectados</h3>
                         <span className="bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] px-4 py-1 rounded-full text-xs font-bold border border-[var(--brand-primary)]/20">
                             {words.length} UNIDADES
                         </span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                         <div className="space-y-2">
                             {words.map((w, idx) => (
                                 <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group">
                                     <div className="text-[var(--brand-primary)] font-mono w-8 text-center text-xs">{idx + 1}</div>
                                     <div className="flex-1 grid grid-cols-2 gap-4">
                                         <div className="font-bold text-lg text-white">{w.eng}</div>
                                         <div className="text-gray-400 text-lg">{w.esp}</div>
                                     </div>
                                     <button 
                                        onClick={() => setWords(words.filter((_, i) => i !== idx))}
                                        className="p-2 opacity-50 group-hover:opacity-100 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"
                                     >
                                        <X className="w-5 h-5" />
                                     </button>
                                 </div>
                             ))}
                             {words.length === 0 && (
                                 <div className="p-12 text-center text-gray-500 font-mono">NO DATA FOUND</div>
                             )}
                         </div>
                    </div>
                </div>

                {/* Sidebar Save Area */}
                <NeonCard color="primary" className="lg:col-span-4 p-8 flex flex-col gap-6 h-fit sticky top-4">
                     <div>
                        <label className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-widest mb-3 block">IDENTIFICADOR DE COLECCIÓN</label>
                        <Input 
                            value={targetTopicName}
                            onChange={(e) => setTargetTopicName(e.target.value)}
                            placeholder="EJ: TECNOLOGÍA"
                            className="bg-black/50 border-[var(--brand-primary)]/30 h-14 text-lg focus:border-[var(--brand-primary)] font-bold text-white"
                        />
                     </div>
                     
                     <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                         <h4 className="font-bold text-white mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                             <Sparkles className="w-4 h-4 text-yellow-400" /> Resumen de Ingesta
                         </h4>
                         <p className="text-xs text-gray-400 leading-relaxed font-mono">
                             Se generarán <strong>{words.length}</strong> nuevos registros en la base de datos de conocimiento.
                         </p>
                     </div>

                     <div className="mt-auto pt-4 space-y-3">
                        <Button 
                            className="w-full h-16 text-xl font-black uppercase tracking-widest shadow-[0_0_20px_-5px_var(--brand-primary)]"
                            onClick={handleSave}
                            disabled={!targetTopicName || words.length === 0}
                            isLoading={loading}
                        >
                            Confirmar
                        </Button>
                        <Button variant="ghost" className="w-full text-xs text-gray-500 hover:text-white" onClick={() => setStep('input')}>
                            DESCARTAR y VOLVER
                        </Button>
                     </div>
                </NeonCard>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
