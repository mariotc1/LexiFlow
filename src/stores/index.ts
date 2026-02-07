import { create } from 'zustand';
import { dbService } from '../lib/db';
import { Tema, Palabra, Partida, ModoJuego } from '../types';

// --- Topics Store ---
interface TemaStore {
  temas: Tema[];
  loading: boolean;
  loadTemas: () => Promise<void>;
  addTema: (nombre: string) => Promise<string>;
  deleteTema: (id: string) => Promise<void>;
}

export const useTemaStore = create<TemaStore>((set, get) => ({
  temas: [],
  loading: false,
  loadTemas: async () => {
    set({ loading: true });
    const temas = await dbService.getTemas();
    set({ temas, loading: false });
  },
  addTema: async (nombre: string) => {
    const id = crypto.randomUUID();
    const newTema: Tema = { id, nombre, fechaCreacion: Date.now() };
    await dbService.addTema(newTema);
    set(state => ({ temas: [...state.temas, newTema] }));
    return id;
  },
  deleteTema: async (id: string) => {
    await dbService.deleteTema(id);
    set(state => ({ temas: state.temas.filter(t => t.id !== id) }));
  }
}));

// --- Game Store ---
interface GameState {
  isPlaying: boolean;
  currentWordIndex: number;
  score: number;
  words: Palabra[];
  results: { correct: number; incorrect: number };
  gameMode: ModoJuego;
  startGame: (words: Palabra[], mode: ModoJuego) => void;
  submitAnswer: (correct: boolean) => void;
  endGame: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  isPlaying: false,
  currentWordIndex: 0,
  score: 0,
  words: [],
  results: { correct: 0, incorrect: 0 },
  gameMode: 'mixto',

  startGame: (words, mode) => set({
    isPlaying: true,
    words: words.sort(() => Math.random() - 0.5), // Shuffle
    currentWordIndex: 0,
    score: 0,
    results: { correct: 0, incorrect: 0 },
    gameMode: mode
  }),

  submitAnswer: (correct) => set((state) => ({
    score: correct ? state.score + 10 : state.score,
    results: {
      correct: state.results.correct + (correct ? 1 : 0),
      incorrect: state.results.incorrect + (correct ? 0 : 1)
    },
    currentWordIndex: state.currentWordIndex + 1
  })),

  endGame: () => set({ isPlaying: false }),
  resetGame: () => set({ isPlaying: false, words: [], currentWordIndex: 0 })
}));

// --- Settings Store (Theme, Sound, etc) ---
interface SettingsStore {
  soundEnabled: boolean;
  toggleSound: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  soundEnabled: true,
  toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled }))
}));
