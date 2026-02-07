"use client";

import { useEffect, useState, useRef } from "react";
import { useGameStore } from "@/stores";
import { useRouter } from "next/navigation";
import { checkAnswer, CheckResult } from "@/lib/game";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Volume2 } from "lucide-react";
import { sfx } from "@/lib/sound";

export default function PlayPage() {
  const { words, currentWordIndex, gameMode, isPlaying, submitAnswer, resetGame } = useGameStore();
  const router = useRouter();

  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ result: CheckResult; correct: string; distance: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPlaying || words.length === 0) {
      router.replace("/game");
    }
  }, [isPlaying, words, router]);

  const currentWord = words[currentWordIndex];

  if (!currentWord) return null;

  // Determine prompt and target based on mode
  let prompt = "";
  let target = "";
  let targetLang = "";

  if (gameMode === 'es-en') {
    prompt = currentWord.espanol;
    target = currentWord.ingles;
    targetLang = 'en-US';
  } else if (gameMode === 'en-es') {
    prompt = currentWord.ingles;
    target = currentWord.espanol;
    targetLang = 'es-ES';
  } else {
    // Random mixed
    // Use word id or index to deterministically random
    const isEsEn = (currentWord.ingles.length + currentWord.espanol.length + currentWordIndex) % 2 === 0;
    if (isEsEn) {
      prompt = currentWord.espanol;
      target = currentWord.ingles;
      targetLang = 'en-US';
    } else {
      prompt = currentWord.ingles;
      target = currentWord.espanol;
      targetLang = 'es-ES';
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback) {
      // Next word
      handleNext();
      return;
    }

    const check = checkAnswer(input, target, currentWord.respuestasAlternativas);
    setFeedback({ result: check.result, correct: target, distance: check.distance });
    
    
    // Play sound
    if (check.result === 'correct') {
      sfx.playCorrect();
    } else if (check.result === 'almost') {
      sfx.playAlmost();
    } else {
      sfx.playIncorrect();
    }
  };

  const handleNext = () => {
    if (feedback) {
      submitAnswer(feedback.result === 'correct' || feedback.result === 'almost');
      setFeedback(null);
      setInput("");
      
      if (currentWordIndex >= words.length - 1) {
        router.push("/game/results");
      } else {
        // Focus input
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  const speak = (text: string, lang: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-2xl mx-auto px-4">
      {/* Progress */}
      <div className="w-full bg-white/10 h-2 rounded-full mb-12 overflow-hidden">
        <motion.div 
          className="h-full bg-[var(--brand-primary)]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentWordIndex) / words.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="w-full"
        >
          <div className="text-center mb-12">
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-4">Traduce esta palabra</h2>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{prompt}</h1>
            <Button variant="ghost" size="sm" onClick={() => speak(prompt, targetLang === 'en-US' ? 'es-ES' : 'en-US')}>
              <Volume2 className="h-6 w-6 text-[var(--brand-secondary)]" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!!feedback}
                className={`w-full bg-transparent border-b-2 text-center text-3xl md:text-4xl py-4 focus:outline-none transition-colors ${
                    feedback 
                    ? feedback.result === 'correct' 
                        ? 'border-green-500 text-green-500' 
                        : 'border-red-500 text-red-500' 
                    : 'border-gray-600 focus:border-[var(--brand-primary)] text-white'
                }`}
                placeholder="Escribe tu respuesta..."
                autoFocus
                autoComplete="off"
              />
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`rounded-xl p-4 text-center ${
                    feedback.result === 'correct' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-white'
                  }`}
                >
                  {feedback.result === 'correct' && (
                    <div className="text-xl font-bold">¡Correcto! 🎉</div>
                  )}
                  {feedback.result === 'almost' && (
                    <div>
                      <div className="text-xl font-bold text-yellow-400">¡Casi! 🤔</div>
                      <p className="text-sm mt-1">Tu respuesta: <span className="line-through opacity-70">{input}</span></p>
                      <p className="text-sm">Correcta: <span className="font-bold">{feedback.correct}</span></p>
                    </div>
                  )}
                  {feedback.result === 'incorrect' && (
                    <div>
                      <div className="text-xl font-bold text-red-500">Incorrecto 😔</div>
                      <p className="mt-2 text-lg">La respuesta correcta es: <span className="font-bold text-green-400">{feedback.correct}</span></p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            <Button
                type="submit" 
                size="lg" 
                className={`w-full h-16 text-lg ${feedback ? (feedback.result === 'correct' ? 'bg-green-500 hover:bg-green-600' : 'bg-[var(--brand-secondary)]') : ''}`}
            >
                {feedback ? "Siguiente" : "Comprobar"}
            </Button>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
