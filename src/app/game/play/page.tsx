"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useGameStore } from "@/stores";
import { useRouter } from "next/navigation";
import { checkAnswer, CheckResult } from "@/lib/game";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ArrowRight, CheckCircle, XCircle, AlertCircle, X, Flag } from "lucide-react";
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

  // Focus input aggressively when typing
  useEffect(() => {
    if (!feedback) {
       inputRef.current?.focus();
    }
  }, [currentWordIndex, feedback]);

  const currentWord = words[currentWordIndex];
  
  // Determine prompt and target
  const isEsEn = gameMode === 'es-en' || (gameMode === 'mixto' && (currentWord?.ingles.length + currentWord?.espanol.length + currentWordIndex) % 2 === 0);
  const prompt = currentWord ? (isEsEn ? currentWord.espanol : currentWord.ingles) : "";
  const target = currentWord ? (isEsEn ? currentWord.ingles : currentWord.espanol) : "";
  const targetLang = isEsEn ? 'en-US' : 'es-ES';

  // --- Logic ---

  const processAnswer = useCallback(() => {
      if (!input.trim() || !currentWord) return;

      const check = checkAnswer(input, target, currentWord.respuestasAlternativas);
      setFeedback({ result: check.result, correct: target, distance: check.distance });
      
      if (check.result === 'correct') sfx.playCorrect();
      else if (check.result === 'almost') sfx.playAlmost();
      else sfx.playIncorrect();
  }, [input, target, currentWord]);

  const nextCard = useCallback(() => {
      if (!feedback) return;
      
      submitAnswer(feedback.result === 'correct' || feedback.result === 'almost');
      setFeedback(null);
      setInput("");
      
      if (currentWordIndex >= words.length - 1) {
        router.push("/game/results");
      }
  }, [feedback, submitAnswer, currentWordIndex, words.length, router]);

  // Unified Global Key Handler
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (feedback) {
                nextCard();
            } else {
                processAnswer();
            }
        }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [feedback, nextCard, processAnswer]);


  const handleFinishNow = () => {
      if (confirm("¿Terminar y ver resultados? Las palabras restantes contarán como FALLOS.")) {
          let remaining = words.length - currentWordIndex;
          for (let i = 0; i < remaining; i++) {
             submitAnswer(false); 
          }
          router.push("/game/results");
      }
  };

  const speak = (text: string, lang: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    window.speechSynthesis.speak(u);
  };

  if (!currentWord) return null;

  // --- Visuals ---

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] max-w-4xl mx-auto px-4 relative">
      
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <Button variant="ghost" size="sm" onClick={handleFinishNow} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2">
              <Flag className="w-4 h-4" /> <span className="hidden md:inline">Terminar Ahora</span>
          </Button>
          <div className="text-gray-500 font-mono text-lg font-bold">
            {currentWordIndex + 1} <span className="text-gray-700">/</span> {words.length}
         </div>
      </div>

      {/* Progress Line */}
      <div className="absolute top-0 w-full h-1 bg-white/5 z-20">
        <motion.div 
            className="h-full bg-[var(--brand-primary)] shadow-[0_0_10px_var(--brand-primary)]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentWordIndex) / words.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.id}
          initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full relative perspective-1000"
        >
          {/* THE CARD */}
          <div className={`
                relative w-full aspect-[4/5] md:aspect-[16/9] max-h-[600px]
                rounded-[2rem] md:rounded-[3rem] 
                flex flex-col items-center justify-center 
                border-2 overflow-hidden
                transition-colors duration-500
                ${feedback?.result === 'correct' 
                    ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_100px_-20px_rgba(34,197,94,0.3)]' 
                    : feedback?.result === 'incorrect'
                        ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_100px_-20px_rgba(239,68,68,0.3)]'
                        : 'bg-black/40 border-white/10 shadow-2xl backdrop-blur-2xl'
                }
          `}>
             
              {/* Giant Prompt */}
              <div className="text-center z-10 p-6 md:p-8 w-full flex flex-col justify-center h-full">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8 md:mb-12"
                >
                    <span className="text-[var(--brand-secondary)] font-bold tracking-[0.2em] text-xs md:text-sm uppercase mb-4 block">
                        Traduce al {isEsEn ? 'Inglés' : 'Español'}
                    </span>
                    <h1 
                        className="text-4xl md:text-6xl font-black text-white cursor-pointer hover:scale-105 transition-transform leading-tight"
                        onClick={() => speak(prompt, targetLang === 'en-US' ? 'es-ES' : 'en-US')}
                    >
                        {prompt}
                    </h1>
                </motion.div>

                {/* Input Area */}
                <div className="max-w-xl mx-auto w-full relative min-h-[120px]">
                     <AnimatePresence mode="wait">
                        {!feedback ? (
                            <motion.div
                                key="input-container"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full bg-transparent border-b-2 md:border-b-4 border-white/20 text-center text-3xl md:text-5xl py-4 focus:outline-none focus:border-[var(--brand-primary)] text-white placeholder-white/10 font-medium transition-all"
                                    placeholder="Escribe aquí..."
                                    autoFocus
                                    autoComplete="off"
                                />
                                <div className="mt-8 md:hidden">
                                     <Button 
                                        size="lg" 
                                        onClick={processAnswer} 
                                        className="w-full shadow-lg bg-[var(--brand-primary)] text-white"
                                     >
                                         Comprobar
                                     </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="feedback-active"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center"
                            >
                                {feedback.result === 'correct' && (
                                    <div className="text-green-400 text-3xl md:text-5xl font-bold flex items-center gap-4 animate-bounce-short">
                                        <CheckCircle className="w-8 h-8 md:w-12 md:h-12" /> Correcto
                                    </div>
                                )}
                                {feedback.result === 'almost' && (
                                    <div className="text-yellow-400 text-2xl md:text-4xl font-bold flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-3"><AlertCircle className="w-8 h-8 md:w-10 md:h-10" /> Casi...</div>
                                        <div className="text-white text-xl md:text-2xl mt-2">{feedback.correct}</div>
                                    </div>
                                )}
                                {feedback.result === 'incorrect' && (
                                    <div className="text-red-500 text-2xl md:text-4xl font-bold flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-3"><XCircle className="w-8 h-8 md:w-10 md:h-10" /> Incorrecto</div>
                                        <div className="text-white text-xl md:text-2xl mt-2 opacity-80 line-through">{input}</div>
                                        <div className="text-green-400 text-2xl md:text-3xl mt-1">{feedback.correct}</div>
                                    </div>
                                )}
                                
                                <div className="mt-8 w-full flex flex-col items-center gap-4">
                                    <Button 
                                        onClick={nextCard} 
                                        size="lg" 
                                        className={`w-full md:w-auto px-12 h-14 text-xl shadow-xl hover:scale-105 transition-transform ${
                                            feedback.result === 'correct' ? 'bg-green-500 hover:bg-green-600' : 
                                            feedback.result === 'incorrect' ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'
                                        }`}
                                    >
                                        Continuar <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                    <div className="text-gray-500 text-xs md:text-sm uppercase tracking-widest hidden md:block">
                                        o presiona <span className="text-white font-bold mx-1">ENTER</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                     </AnimatePresence>
                </div>
              </div>

              {/* Background Glows */}
              <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[var(--brand-primary)]/10 via-transparent to-[var(--brand-secondary)]/10 blur-3xl -z-10" />
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
