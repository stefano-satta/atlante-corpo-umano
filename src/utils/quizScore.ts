import type { QuizTheme } from '@/models/atlas';

// Miglior risultato del quiz per tema (D53), ricordato solo in questo browser: niente account
// né server (D5, D11). Senza memoria disponibile il quiz funziona lo stesso, senza record.

const KEY = 'atlante.quiz';

export interface QuizScore {
  correct: number;
  total: number;
}

function readAll(): Partial<Record<QuizTheme, QuizScore>> {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

const ratio = (s: QuizScore) => (s.total ? s.correct / s.total : 0);

/** Miglior risultato del tema, se valido. */
export function bestScore(theme: QuizTheme): QuizScore | null {
  const s = readAll()[theme];
  return s && Number.isInteger(s.correct) && Number.isInteger(s.total) && s.total > 0 ? s : null;
}

/** Ricorda il risultato se è il migliore del tema; dice se è un nuovo record. */
export function saveScore(theme: QuizTheme, score: QuizScore) {
  const best = bestScore(theme);
  if (best && ratio(best) >= ratio(score)) return false;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [theme]: score }));
  } catch {
    // Memoria del browser non disponibile (navigazione privata, dati bloccati): nessun record.
  }
  return true;
}
