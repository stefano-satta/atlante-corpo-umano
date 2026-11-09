import type { Layer, QuizTheme } from '@/models/atlas';
import type { QuizQuestion, QuizThemeSummary } from '@/models/content';
import { LAYER_SLUGS } from './url';

// Quiz di autoverifica (D53): logica pura, senza React. Le domande arrivano dai moduli
// `virtual:contenuti/quiz/<apparato>`, con la prima risposta giusta; qui si pescano e si mescolano.

/** Domande per giro: un apparato, oppure il quiz completo con domande di tutti gli apparati. */
export const ROUND_SIZE = 10;
export const FULL_ROUND_SIZE = 20;

/** Domande per giro del tema scelto. */
export const roundSize = (theme: QuizTheme) => (theme === 'completa' ? FULL_ROUND_SIZE : ROUND_SIZE);

/** Generatore di numeri in [0, 1): `Math.random`, o uno con seme nei test. */
export type Random = () => number;

const LAYER_OF_SLUG = new Map(Object.entries(LAYER_SLUGS).map(([layer, slug]) => [slug, layer as Layer]));

/** Strato della barra che mostra le domande di un tema dei contenuti (`cardiocircolatorio` → `vasi`). */
export const layerOfQuizTheme = (slug: string) => LAYER_OF_SLUG.get(slug);

/** Temi dei contenuti da caricare per un tema del quiz: uno, oppure tutti quelli con domande. */
export function quizSlugs(theme: QuizTheme, available: readonly string[]) {
  if (theme === 'completa') return [...available];
  const slug = LAYER_SLUGS[theme];
  return available.includes(slug) ? [slug] : [];
}

/** Le domande "indica" chiedono di guardare il corpo 3D: senza 3D (versione solo testo) restano fuori. */
const isPlayable = (question: Pick<QuizQuestion, 'tipo'>, textOnly: boolean) => !textOnly || question.tipo !== 'indica';

/** Domande di un tema che si possono mostrare. */
export const playableQuestions = (questions: readonly QuizQuestion[], textOnly: boolean) =>
  questions.filter((q) => isPlayable(q, textOnly));

/** Quante domande di un tema si possono mostrare, contate dall'indice senza scaricarle. */
export const playableCount = (summary: QuizThemeSummary | undefined, textOnly: boolean) =>
  summary ? summary.domande - (textOnly ? summary.indica : 0) : 0;

/** Copia mescolata (Fisher–Yates). */
export function shuffle<T>(items: readonly T[], random: Random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Domande di un giro. Con più temi si pesca a turno da ciascuno, così il quiz completo copre tutti
 * gli apparati invece di seguire quanti ne ha ognuno; l'ordine finale è mescolato.
 */
export function drawQuestions(groups: readonly (readonly QuizQuestion[])[], size: number, random: Random) {
  const queues = shuffle(
    groups.filter((g) => g.length),
    random,
  ).map((g) => shuffle(g, random));
  const drawn: QuizQuestion[] = [];
  while (drawn.length < size && queues.some((q) => q.length))
    for (const q of queues) {
      const next = q.pop();
      if (next && drawn.length < size) drawn.push(next);
    }
  return shuffle(drawn, random);
}

/** Domanda pronta da mostrare: risposte in ordine casuale e posizione di quella giusta. */
export interface PreparedQuestion {
  question: QuizQuestion;
  answers: string[];
  correct: number;
}

export function prepareQuestion(question: QuizQuestion, random: Random): PreparedQuestion {
  const order = shuffle([0, 1, 2, 3], random);
  return { question, answers: order.map((i) => question.risposte[i]), correct: order.indexOf(0) };
}

/** Giro pronto: domande pescate, ognuna con le risposte mescolate. */
export const drawRound = (groups: readonly (readonly QuizQuestion[])[], size: number, random: Random) =>
  drawQuestions(groups, size, random).map((q) => prepareQuestion(q, random));

/** Lettere delle risposte, che sono anche i tasti per sceglierle. */
export const ANSWER_LETTERS = ['A', 'B', 'C', 'D'] as const;

/** Risposta scelta con un tasto (`a`–`d`, maiuscole comprese), oppure -1. */
export const answerIndexOfKey = (key: string) =>
  ANSWER_LETTERS.indexOf(key.toUpperCase() as (typeof ANSWER_LETTERS)[number]);

/** Esito di una risposta dopo la scelta: giusta, sbagliata scelta, o un'altra. Prima della scelta, nessuno. */
export type AnswerResult = 'correct' | 'wrong' | 'other';

export function answerResult(index: number, correct: number, chosen: number | null): AnswerResult | undefined {
  if (chosen === null) return undefined;
  if (index === correct) return 'correct';
  return index === chosen ? 'wrong' : 'other';
}
