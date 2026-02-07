export interface Tema {
  id: string;
  nombre: string;
  fechaCreacion: number;
}

export interface Palabra {
  id: string;
  idTema: string;
  ingles: string;
  espanol: string;
  respuestasAlternativas?: string[];
  nivel?: "facil" | "medio" | "dificil"; // Computed based on historical performance?
  aciertos: number;
  fallos: number;
  ultimoRepaso: number;
}

export type ModoJuego = "es-en" | "en-es" | "mixto";

export interface Partida {
  id: string;
  fecha: number;
  idTema: string;
  modo: ModoJuego;
  puntuacion: number;
  tiempoTotal: number; // segundos
  respuestas: RespuestaPartida[];
}

export interface RespuestaPartida {
  idPalabra: string;
  respuestaUsuario: string;
  correcta: boolean;
  casiCorrecta: boolean; // For typo tolerance
  tiempoRespuesta: number; // ms
}

export interface Stats {
  totalPartidas: number;
  totalPalabras: number;
  aciertosTotales: number;
  fallosTotales: number;
  diasRacha: number;
  ultimaFechaJuego: number;
}
