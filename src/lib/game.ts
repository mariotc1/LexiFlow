export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
    .trim()
    .replace(/\s+/g, " "); // Collapse multiple spaces
};

export const calculateLevenshtein = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
};

export type CheckResult = 'correct' | 'almost' | 'incorrect';

export const checkAnswer = (input: string, correct: string, alternatives: string[] = []): { result: CheckResult; distance: number; bestMatch: string } => {
  const normalizedInput = normalizeText(input);
  const possibleAnswers = [correct, ...alternatives].map(a => normalizeText(a));
  
  let bestDist = Infinity;
  let bestMatch = correct;

  for (const answer of possibleAnswers) {
    const dist = calculateLevenshtein(normalizedInput, answer);
    if (dist < bestDist) {
      bestDist = dist;
      bestMatch = answer;
    }
  }

  // Thresholds
  // 0 distance = correct
  // <= 2 distance AND length > 4 = almost (typo tolerance)
  // else incorrect
  
  let result: CheckResult = 'incorrect';
  if (bestDist === 0) {
    result = 'correct';
  } else if (bestDist <= 2 && correct.length >= 4) {
    result = 'almost';
  }

  return { result, distance: bestDist, bestMatch };
};
