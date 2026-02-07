"use client";

import { useEffect, useState, useRef } from "react";
import { useGameStore } from "@/stores";
import { useRouter } from "next/navigation";
import { checkAnswer, CheckResult } from "@/lib/game";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ArrowRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { sfx } from "@/lib/sound";

export default function PlayPage() {
  const { words, currentWordIndex, gameMode, isPlaying, submitAnswer } = useGameStore();
  const router = useRouter();

  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ result: CheckResult; correct: string; distance: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPlaying || words.length === 0) {
      router.replace("/game");
    }
  }, [isPlaying, words, router]);

  // Focus input on mount and next word
  useEffect(() => {
    if (!feedback) {
       inputRef.current?.focus();
    }
  }, [currentWordIndex, feedback]);

  const currentWord = words[currentWordIndex];
  if (!currentWord) return null;

  // Determine prompt and target
  let prompt = "";
  let target = "";
  let targetLang = "";

  // Helper to determine mode per word if mixed
  const isEsEn = gameMode === 'es-en' || (gameMode === 'mixto' && (currentWord.ingles.length + currentWord.espanol.length + currentWordIndex) % 2 === 0);

  if (isEsEn) {
    prompt = currentWord.espanol;
    target = currentWord.ingles;
    targetLang = 'en-US';
  } else {
    prompt = currentWord.ingles;
    target = currentWord.espanol;
    targetLang = 'es-ES';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback) {
      handleNext();
      return;
    }

    if (!input.trim()) return;

    const check = checkAnswer(input, target, currentWord.respuestasAlternativas);
    setFeedback({ result: check.result, correct: target, distance: check.distance });
    
    if (check.result === 'correct') sfx.playCorrect();
    else if (check.result === 'almost') sfx.playAlmost();
    else sfx.playIncorrect();
  };

  const handleNext = () => {
    if (feedback) {
      submitAnswer(feedback.result === 'correct' || feedback.result === 'almost');
      setFeedback(null);
      setInput("");
      
      if (currentWordIndex >= words.length - 1) {
        router.push("/game/results");
      }
    }
  };

  const speak = (text: string, lang: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] max-w-3xl mx-auto px-4 relative">
      
      {/* Header Progress */}
      <div className="absolute top-0 w-full flex items-center justify-between p-4">
         <div className="text-gray-400 font-mono text-sm">
            {currentWordIndex + 1} / {words.length}
         </div>
         <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
               className="h-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]"
               initial={{ width: 0 }}
               animate={{ width: `${((currentWordIndex) / words.length) * 100}%` }}
               transition={{ duration: 0.5 }}
            />
         </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.id}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full glass-panel p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Background Gradient for Card */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-accent)]" />

          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-gray-400 mb-6 uppercase">
                Traduce al {isEsEn ? 'Inglés' : 'Español'}
            </span>
            
            <div className="relative group cursor-pointer" onClick={() => speak(prompt, targetLang === 'en-US' ? 'es-ES' : 'en-US')}>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-2 tracking-tight">
                    {prompt}
                </h1>
                <Volume2 className="w-6 h-6 text-gray-500 mx-auto opacity-0 group-hover:opacity-100 transition-opacity absolute -right-8 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 max-w-md mx-auto">
            <div className="relative group">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!!feedback}
                className={`w-full bg-black/20 border-b-2 text-center text-3xl md:text-4xl py-4 focus:outline-none transition-all duration-300 font-medium ${
                    feedback 
                    ? feedback.result === 'correct' 
                        ? 'border-green-500 text-green-400' 
                        : 'border-red-500 text-red-400' 
                    : 'border-white/20 focus:border-[var(--brand-primary)] text-white placeholder:text-white/20'
                }`}
                placeholder="Escribe aquí..."
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {/* Visual Feedback Area */}
            <div className="h-32 flex items-center justify-center">
                <AnimatePresence mode="wait">
                {feedback ? (
                    <motion.div
                        key="feedback"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center w-full"
                    >
                         {feedback.result === 'correct' && (
                            <div className="flex flex-col items-center gap-2">
                                <CheckCircle className="w-12 h-12 text-green-400" />
                                <span className="text-2xl font-bold text-green-400">¡Correcto!</span>
                            </div>
                         )}
                         {feedback.result === 'almost' && (
                            <div className="flex flex-col items-center gap-2">
                                <AlertCircle className="w-12 h-12 text-yellow-400" />
                                <span className="text-2xl font-bold text-yellow-400">¡Casi!</span>
                                <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 mt-2">
                                    <span className="text-gray-400 text-sm">Respuesta: </span>
                                    <span className="text-white font-bold">{feedback.correct}</span>
                                </div>
                            </div>
                         )}
                         {feedback.result === 'incorrect' && (
                            <div className="flex flex-col items-center gap-2">
                                <XCircle className="w-12 h-12 text-red-400" />
                                <span className="text-2xl font-bold text-red-400">Incorrecto</span>
                                <div className="bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/20 mt-2">
                                    <span className="text-red-200 text-sm mr-2">La solución era:</span>
                                    <span className="text-white font-bold text-lg">{feedback.correct}</span>
                                </div>
                            </div>
                         )}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="text-gray-600 text-sm"
                    >
                        Presiona <kbd className="font-sans px-2 py-1 bg-white/10 rounded-md border border-white/5 ml-1">Enter</kbd> para comprobar
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
            
            <AnimatePresence>
                {feedback && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                         <Button
                            type="button"
                            onClick={handleNext}
                            size="lg" 
                            className={`w-full h-16 text-xl shadow-lg ${
                                feedback.result === 'correct' 
                                ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' 
                                : feedback.result === 'incorrect'
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                : 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20 text-black'
                            }`}
                        >
                            Continuar <ArrowRight className="ml-2 w-6 h-6" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
