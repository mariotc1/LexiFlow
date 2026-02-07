import Tesseract from 'tesseract.js';
import { Palabra } from '@/types';
// Note: pdfjs-dist import would require setting up worker.
// We will use a simple text extraction approach or just Tesseract for everything image-based.
// For PDF, we can try using pdfjs-dist if needed, but for now let's focus on OCR and Text.

export interface ParsedWord {
  eng: string;
  esp: string;
}

export const parseTextContent = (text: string): ParsedWord[] => {
  const lines = text.split('\n');
  const words: ParsedWord[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    // Try splitting by common separators: =, -, :
    const parts = line.split(/=|:|-/).map(s => s.trim());
    if (parts.length >= 2) {
      words.push({ eng: parts[0], esp: parts[1] });
    }
  }
  return words;
};

export const parseTxtFile = async (file: File): Promise<ParsedWord[]> => {
  const text = await file.text();
  return parseTextContent(text);
};

export const performOCR = async (imageFile: File, onProgress?: (p: number) => void): Promise<string> => {
  return new Promise((resolve, reject) => {
    Tesseract.recognize(
      imageFile,
      'eng+spa', // Detect both languages
      {
        logger: m => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(m.progress);
          }
        }
      }
    ).then(({ data: { text } }) => {
      resolve(text);
    }).catch(reject);
  });
};
