"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTemaStore } from "@/stores";
import { parseTextContent, performOCR, ParsedWord, parseTxtFile } from "@/lib/import";
import { dbService } from "@/lib/db";
import { useRouter } from "next/navigation";
import { Upload, FileText, Type, Image as ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

type ImportMode = 'manual' | 'paste' | 'file' | 'ocr';

export default function ImportPage() {
  const [mode, setMode] = useState<ImportMode>('paste');
  const [targetTopicName, setTargetTopicName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Preview Data
  const [words, setWords] = useState<ParsedWord[]>([]);
  
  // OCR/File Inputs
  const [textInput, setTextInput] = useState("");
  
  const router = useRouter();
  const { addTema } = useTemaStore();

  const handleProcess = async () => {
    if (mode === 'paste') {
      const parsed = parseTextContent(textInput);
      setWords(prev => [...prev, ...parsed]);
      setTextInput("");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      if (mode === 'file') {
        // Assume text file for now, PDF requires heavier logic
        const parsed = await parseTxtFile(file);
        setWords(prev => [...prev, ...parsed]);
      } else if (mode === 'ocr') {
        const text = await performOCR(file, (p) => setProgress(Math.round(p * 100)));
        const parsed = parseTextContent(text);
        setWords(prev => [...prev, ...parsed]);
      }
    } catch (err) {
      console.error(err);
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
      // 1. Create Topic
      const topicId = await addTema(targetTopicName);
      
      // 2. Add Words
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
      router.push(`/topics/${topicId}`);
    } catch (error) {
      console.error(error);
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Importar Vocabulario</h1>
      
      {/* Mode Selection */}
      <div className="flex gap-4 p-1 bg-white/5 rounded-2xl w-fit">
        {[
          { id: 'paste', label: 'Pegar Texto', icon: Type },
          { id: 'file', label: 'Archivo TXT', icon: FileText },
          { id: 'ocr', label: 'Imagen OCR', icon: ImageIcon },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as ImportMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === m.id ? 'bg-[var(--brand-primary)] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <m.icon className="h-4 w-4" />
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Area */}
        <div className="space-y-4">
          <div className="glass-panel p-6 min-h-[400px]">
            {mode === 'paste' && (
              <div className="flex flex-col h-full">
                <textarea
                  className="flex-1 bg-transparent border-none resize-none focus:outline-none text-white placeholder:text-gray-600 font-mono text-sm"
                  placeholder={`Pegar lista aquí...\nEjemplo:\nDog = Perro\nCat = Gato`}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
                <div className="mt-4 flex justify-end">
                  <Button onClick={handleProcess} disabled={!textInput.trim()}>
                    Procesar Texto
                  </Button>
                </div>
              </div>
            )}

            {(mode === 'file' || mode === 'ocr') && (
              <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-white/10 rounded-xl hover:border-[var(--brand-primary)]/50 transition-colors">
                {loading ? (
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[var(--brand-primary)]" />
                    <p className="text-sm text-gray-400">Procesando... {progress}%</p>
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
                    <label htmlFor="file-upload" className="cursor-pointer text-center">
                      <Upload className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-300 font-medium">Click para subir {mode === 'ocr' ? 'Imagen' : 'TXT'}</p>
                      <p className="text-xs text-gray-500 mt-1">Soporta {mode === 'ocr' ? 'PNG, JPG' : 'UTF-8 TXT'}</p>
                    </label>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="space-y-4">
          <Input 
            placeholder="Nombre del nuevo tema..." 
            value={targetTopicName}
            onChange={(e) => setTargetTopicName(e.target.value)}
            className="text-lg font-bold"
          />
          
          <div className="glass-panel p-0 h-[400px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <span className="font-bold text-sm">Vista Previa ({words.length})</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setWords([])}
                className="text-red-400 hover:text-red-300 h-8"
              >
                Limpiar Todo
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {words.map((w, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5 group"
                >
                  <div className="flex-1">
                    <div className="text-sm font-bold text-[var(--brand-primary)]">{w.eng}</div>
                    <div className="text-sm text-gray-400">{w.esp}</div>
                  </div>
                  <button 
                    onClick={() => setWords(words.filter((_, i) => i !== idx))}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
              {words.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  No hay palabras procesadas
                </div>
              )}
            </div>
          </div>
          
          <Button 
            variant="primary" 
            className="w-full"
            disabled={words.length === 0 || !targetTopicName}
            onClick={handleSave}
            isLoading={loading}
          >
            Guardar Tema
          </Button>
        </div>
      </div>
    </div>
  );
}
