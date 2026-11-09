// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { bestScore, saveScore } from './quizScore';

afterEach(() => localStorage.clear());

describe('miglior risultato del quiz (D53)', () => {
  it('ricorda solo i risultati migliori, per tema', () => {
    expect(bestScore('organi')).toBeNull();
    expect(saveScore('organi', { correct: 6, total: 10 })).toBe(true);
    expect(saveScore('organi', { correct: 5, total: 10 })).toBe(false);
    expect(saveScore('organi', { correct: 8, total: 10 })).toBe(true);
    expect(bestScore('organi')).toEqual({ correct: 8, total: 10 });
    expect(bestScore('completa')).toBeNull();
  });

  it('ignora una memoria illeggibile', () => {
    localStorage.setItem('atlante.quiz', '{rotto');
    expect(bestScore('organi')).toBeNull();
    expect(saveScore('organi', { correct: 1, total: 10 })).toBe(true);
  });
});
