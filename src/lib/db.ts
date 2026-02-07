import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Tema, Palabra, Partida } from '../types';

interface LexiFlowDB extends DBSchema {
  temas: {
    key: string;
    value: Tema;
    indexes: { 'by-date': number };
  };
  palabras: {
    key: string;
    value: Palabra;
    indexes: { 'by-tema': string };
  };
  partidas: {
    key: string;
    value: Partida;
    indexes: { 'by-date': number; 'by-tema': string };
  };
}

const DB_NAME = 'lexiflow-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LexiFlowDB>>;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<LexiFlowDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Temas Store
        if (!db.objectStoreNames.contains('temas')) {
          const temasStore = db.createObjectStore('temas', { keyPath: 'id' });
          temasStore.createIndex('by-date', 'fechaCreacion');
        }
        
        // Palabras Store
        if (!db.objectStoreNames.contains('palabras')) {
          const palabrasStore = db.createObjectStore('palabras', { keyPath: 'id' });
          palabrasStore.createIndex('by-tema', 'idTema');
        }

        // Partidas Store
        if (!db.objectStoreNames.contains('partidas')) {
          const partidasStore = db.createObjectStore('partidas', { keyPath: 'id' });
          partidasStore.createIndex('by-date', 'fecha');
          partidasStore.createIndex('by-tema', 'idTema');
        }
      },
    });
  }
  return dbPromise;
};

export const dbService = {
  async getTemas(): Promise<Tema[]> {
    const db = await getDB();
    return db.getAllFromIndex('temas', 'by-date');
  },

  async addTema(tema: Tema): Promise<void> {
    const db = await getDB();
    await db.put('temas', tema);
  },

  async deleteTema(id: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(['temas', 'palabras', 'partidas'], 'readwrite');
    await tx.objectStore('temas').delete(id);
    
    // Delete associated words
    const wordsIdx = tx.objectStore('palabras').index('by-tema');
    let cursor = await wordsIdx.openCursor(IDBKeyRange.only(id));
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    
    // Delete associated games? Optional, maybe keep history? 
    // Let's keep history but maybe mark as deleted theme? 
    // For now simple implementation: keep history.
    
    await tx.done;
  },

  async getPalabras(idTema: string): Promise<Palabra[]> {
    const db = await getDB();
    return db.getAllFromIndex('palabras', 'by-tema', idTema);
  },
  
  async getAllPalabras(): Promise<Palabra[]> {
    const db = await getDB();
    return db.getAll('palabras');
  },

  async addPalabra(palabra: Palabra): Promise<void> {
    const db = await getDB();
    await db.put('palabras', palabra);
  },

  async deletePalabra(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('palabras', id);
  },
  
  async updatePalabraStats(id: string, acierto: boolean): Promise<void> {
    const db = await getDB();
    const palabra = await db.get('palabras', id);
    if (palabra) {
      if (acierto) palabra.aciertos++;
      else palabra.fallos++;
      palabra.ultimoRepaso = Date.now();
      await db.put('palabras', palabra);
    }
  },

  async savePartida(partida: Partida): Promise<void> {
    const db = await getDB();
    await db.add('partidas', partida);
  },

  async getPartidas(): Promise<Partida[]> {
    const db = await getDB();
    return db.getAllFromIndex('partidas', 'by-date');
  },
  
  async importData(temas: Tema[], palabras: Palabra[]) {
    const db = await getDB();
    const tx = db.transaction(['temas', 'palabras'], 'readwrite');
    // Bulk put
    await Promise.all([
      ...temas.map(t => tx.objectStore('temas').put(t)),
      ...palabras.map(p => tx.objectStore('palabras').put(p))
    ]);
    await tx.done;
  }
};
