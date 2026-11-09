import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '@/models/content';
import type { PreparedQuestion } from './quiz';
import { initialQuizRound, type QuizRound, quizRoundReducer } from './quizRound';

const prepared = (id: string, correct = 0): PreparedQuestion => ({
  question: { id } as QuizQuestion,
  answers: ['a', 'b', 'c', 'd'],
  correct,
});
const two = [prepared('uno', 0), prepared('due', 2)];
const started = quizRoundReducer(initialQuizRound, { type: 'start', questions: two });

describe('giro del quiz (D53)', () => {
  it('parte dalla prima domanda, senza risposta e senza punti', () => {
    expect(started).toMatchObject({ phase: 'question', index: 0, chosen: null, correct: 0 });
    expect(quizRoundReducer(initialQuizRound, { type: 'start', questions: [] })).toBe(initialQuizRound);
  });

  it('conta le risposte giuste e non permette di cambiare idea', () => {
    const right = quizRoundReducer(started, { type: 'choose', answer: 0 });
    expect(right).toMatchObject({ chosen: 0, correct: 1 });
    expect(quizRoundReducer(right, { type: 'choose', answer: 1 })).toBe(right);
  });

  it('va avanti solo dopo aver risposto e finisce solo all’ultima domanda', () => {
    expect(quizRoundReducer(started, { type: 'advance' })).toBe(started);
    const first = quizRoundReducer(started, { type: 'choose', answer: 0 });
    expect(quizRoundReducer(first, { type: 'finish', previous: null, record: true })).toBe(first);

    const second = quizRoundReducer(first, { type: 'advance' });
    expect(second).toMatchObject({ index: 1, chosen: null, correct: 1 });
    const wrong = quizRoundReducer(second, { type: 'choose', answer: 0 });
    expect(quizRoundReducer(wrong, { type: 'advance' })).toBe(wrong);

    const end: QuizRound = quizRoundReducer(wrong, { type: 'finish', previous: null, record: true });
    expect(end).toEqual({ phase: 'result', score: { correct: 1, total: 2 }, previous: null, record: true });
  });
});
