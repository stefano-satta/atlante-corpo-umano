import { useReducer } from 'react';
import type { QuizTheme } from '@/models/atlas';
import type { QuizQuestion } from '@/models/content';
import { drawRound, roundSize } from '@/utils/quiz';
import { initialQuizRound, isLastQuestion, quizRoundReducer, roundScore } from '@/utils/quizRound';
import { bestScore, saveScore } from '@/utils/quizScore';

/** Un giro del quiz (D53): pesca le domande, registra le risposte e alla fine salva il miglior risultato. */
export function useQuizRound(theme: QuizTheme | null) {
  const [round, dispatch] = useReducer(quizRoundReducer, initialQuizRound);

  const start = (groups: readonly (readonly QuizQuestion[])[]) => {
    if (theme) dispatch({ type: 'start', questions: drawRound(groups, roundSize(theme), Math.random) });
  };

  const choose = (answer: number) => dispatch({ type: 'choose', answer });

  const next = () => {
    if (round.phase !== 'question' || round.chosen === null) return;
    if (!isLastQuestion(round)) {
      dispatch({ type: 'advance' });
      return;
    }
    if (!theme) return;
    // Il record si legge prima di salvare il nuovo risultato. Il salvataggio sta qui, nel gestore
    // dell'evento, e non nel reducer: in StrictMode il reducer può girare due volte.
    const previous = bestScore(theme);
    const record = saveScore(theme, roundScore(round));
    dispatch({ type: 'finish', previous, record });
  };

  return { round, start, choose, next };
}
