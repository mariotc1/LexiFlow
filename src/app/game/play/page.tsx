"use client";

import { useEffect, useState, useRef } from "react";
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

  // Stats for the "Finish Now" logic
  // We need to know how many are left to penalize them if they quit early.
  
  useEffect(() => {
    if (!isPlaying || words.length === 0) {
      router.replace("/game");
    }
  }, [isPlaying, words, router]);

  // Focus input aggressively
  useEffect(() => {
    if (!feedback) {
       inputRef.current?.focus();
    }
  }, [currentWordIndex, feedback]);

  const currentWord = words[currentWordIndex];
  if (!currentWord) return null;

  // Determine prompt and target
  const isEsEn = gameMode === 'es-en' || (gameMode === 'mixto' && (currentWord.ingles.length + currentWord.espanol.length + currentWordIndex) % 2 === 0);
  const prompt = isEsEn ? currentWord.espanol : currentWord.ingles;
  const target = isEsEn ? currentWord.ingles : currentWord.espanol;
  const targetLang = isEsEn ? 'en-US' : 'es-ES';

  // --- Logic ---

  const processAnswer = () => {
      if (!input.trim()) return;

      const check = checkAnswer(input, target, currentWord.respuestasAlternativas);
      setFeedback({ result: check.result, correct: target, distance: check.distance });
      
      if (check.result === 'correct') sfx.playCorrect();
      else if (check.result === 'almost') sfx.playAlmost();
      else sfx.playIncorrect();
  };

  const nextCard = () => {
      if (!feedback) return;
      
      submitAnswer(feedback.result === 'correct' || feedback.result === 'almost');
      setFeedback(null);
      setInput("");
      
      if (currentWordIndex >= words.length - 1) {
        router.push("/game/results");
      }
  };

  // Unified Key Handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          if (feedback) {
              nextCard();
          } else {
              processAnswer();
          }
      }
  };

  const handleFinishNow = () => {
      if (confirm("¿Terminar y ver resultados? Las palabras restantes contarán como FALLOS.")) {
          // Iterate remaining words and mark as incorrect
          // Actually, we just need to loop call submitAnswer(false) for remaining?
          // But state updates are async/batched in Zustand usually.
          // Better approach: Direct router push to results? 
          // No, results page relies on `resultsDetails` in store.
          // We have to update the store manually or loop via a store action if available.
          // Since we don't have a bulk-fail action, let's just use a loop.
          // However, `submitAnswer` advances index.
          
          let remaining = words.length - currentWordIndex;
          // We can just loop calling submitAnswer(false) synchronously?
          // Zustand `set` is synchronous usually.
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

  // --- Visuals ---

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] max-w-4xl mx-auto px-4 relative">
      
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleFinishNow} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2">
              <Flag className="w-4 h-4" /> Terminar Ahora
          </Button>
          <div className="text-gray-500 font-mono text-xl font-bold">
            {currentWordIndex + 1} <span className="text-gray-700">/</span> {words.length}
         </div>
      </div>

      {/* Progress Line */}
      <div className="absolute top-0 w-full h-1 bg-white/5">
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
          initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full relative perspective-1000"
        >
          {/* THE CARD */}
          <div className={`
                relative w-full aspect-[4/3] md:aspect-[16/9] max-h-[600px]
                rounded-[3rem] 
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
              <div className="text-center z-10 p-8 w-full">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8"
                >
                    <span className="text-[var(--brand-secondary)] font-bold tracking-[0.2em] text-sm uppercase mb-4 block">
                        Traduce al {isEsEn ? 'Inglés' : 'Español'}
                    </span>
                    <h1 
                        className="text-6xl md:text-8xl font-black text-white cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => speak(prompt, targetLang === 'en-US' ? 'es-ES' : 'en-US')}
                    >
                        {prompt}
                    </h1>
                </motion.div>

                {/* Input Area */}
                <div className="max-w-xl mx-auto relative">
                     <AnimatePresence mode="wait">
                        {!feedback ? (
                            <motion.input
                                key="input-active"
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full bg-transparent border-b-4 border-white/20 text-center text-4xl md:text-5xl py-4 focus:outline-none focus:border-[var(--brand-primary)] text-white placeholder-white/10 font-medium transition-all"
                                placeholder="Escribe aquí..."
                                autoFocus
                                autoComplete="off"
                            />
                        ) : (
                            <motion.div
                                key="feedback-active"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center"
                            >
                                {feedback.result === 'correct' && (
                                    <div className="text-green-400 text-5xl font-bold flex items-center gap-4 animate-bounce-short">
                                        <CheckCircle className="w-12 h-12" /> Correcto
                                    </div>
                                )}
                                {feedback.result === 'almost' && (
                                    <div className="text-yellow-400 text-4xl font-bold flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-3"><AlertCircle className="w-10 h-10" /> Casi...</div>
                                        <div className="text-white text-2xl mt-2">{feedback.correct}</div>
                                    </div>
                                )}
                                {feedback.result === 'incorrect' && (
                                    <div className="text-red-500 text-4xl font-bold flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-3"><XCircle className="w-10 h-10" /> Incorrecto</div>
                                        <div className="text-white text-2xl mt-2 opacity-80 line-through">{input}</div>
                                        <div className="text-green-400 text-3xl mt-1">{feedback.correct}</div>
                                    </div>
                                )}
                                
                                <div className="mt-8 text-gray-500 text-sm uppercase tracking-widest">
                                    Presiona <span className="text-white font-bold mx-1">ENTER</span> para continuar
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

      <div className="mt-8 text-white/20 text-sm">
         {feedback ? "Pulsa Enter para seguir" : "Pulsa Enter para comprobar"}
      </div>
    </div>
  );
}
