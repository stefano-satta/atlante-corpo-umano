import type { PreparedQuestion } from './quiz';
import type { QuizScore } from './quizScore';

// Svolgimento di un giro del quiz (D53) come macchina a stati pura: scelta del tema → domande → risultato.
// Il salvataggio del punteggio è un effetto esterno: lo fa chi usa il reducer, prima di 'finish'.

export type QuizRound =
  | { phase: 'setup' }
  | { phase: 'question'; questions: PreparedQuestion[]; index: number; chosen: number | null; correct: number }
  | { phase: 'result'; score: QuizScore; previous: QuizScore | null; record: boolean };

type QuestionRound = Extract<QuizRound, { phase: 'question' }>;

export type QuizRoundAction =
  | { type: 'start'; questions: PreparedQuestion[] }
  | { type: 'choose'; answer: number }
  | { type: 'advance' }
  | { type: 'finish'; previous: QuizScore | null; record: boolean };

export const initialQuizRound: QuizRound = { phase: 'setup' };

const answered = (round: QuizRound): round is QuestionRound & { chosen: number } =>
  round.phase === 'question' && round.chosen !== null;

export const isLastQuestion = (round: QuestionRound) => round.index === round.questions.length - 1;

export const roundScore = (round: QuestionRound): QuizScore => ({
  correct: round.correct,
  total: round.questions.length,
});

export function quizRoundReducer(round: QuizRound, action: QuizRoundAction): QuizRound {
  switch (action.type) {
    case 'start':
      if (!action.questions.length) return round;
      return { phase: 'question', questions: action.questions, index: 0, chosen: null, correct: 0 };
    case 'choose': {
      // Dopo la risposta non si cambia idea.
      if (round.phase !== 'question' || round.chosen !== null) return round;
      const right = action.answer === round.questions[round.index].correct;
      return { ...round, chosen: action.answer, correct: round.correct + (right ? 1 : 0) };
    }
    case 'advance':
      if (!answered(round) || isLastQuestion(round)) return round;
      return { ...round, index: round.index + 1, chosen: null };
    case 'finish':
      if (!answered(round) || !isLastQuestion(round)) return round;
      return { phase: 'result', score: roundScore(round), previous: action.previous, record: action.record };
  }
}
