import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '@/models/content';
import {
  answerIndexOfKey,
  answerResult,
  drawQuestions,
  layerOfQuizTheme,
  playableCount,
  playableQuestions,
  prepareQuestion,
  quizSlugs,
  roundSize,
  shuffle,
} from './quiz';

/** Generatore con seme (mulberry32): stessi numeri a ogni esecuzione. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const q = (id: string, tema = 'organi'): QuizQuestion => ({
  id,
  tema,
  tipo: 'testo',
  domanda: id,
  risposte: ['giusta', 'b', 'c', 'd'],
  struttura: 'cuore',
  nomeStruttura: 'Cuore',
  unita: 'cuore',
  evidenzia: { gruppi: ['cuore'], fma: [] },
  spiegazione: '',
  fonti: [],
  stato: 'bozza',
});

describe('quiz (D53)', () => {
  it('mescola in modo ripetibile con lo stesso seme, senza perdere elementi', () => {
    const a = shuffle([1, 2, 3, 4, 5, 6], seeded(1));
    expect(a).toEqual(shuffle([1, 2, 3, 4, 5, 6], seeded(1)));
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('tiene traccia della risposta giusta dopo il mescolamento', () => {
    for (let seed = 0; seed < 20; seed++) {
      const p = prepareQuestion(q('x'), seeded(seed));
      expect(p.answers[p.correct]).toBe('giusta');
      expect([...p.answers].sort()).toEqual(['b', 'c', 'd', 'giusta']);
    }
  });

  it('pesca al massimo le domande richieste, senza ripeterle', () => {
    const pool = Array.from({ length: 15 }, (_, i) => q(`q${i}`));
    const drawn = drawQuestions([pool], 10, seeded(3));
    expect(drawn).toHaveLength(10);
    expect(new Set(drawn.map((d) => d.id)).size).toBe(10);
    expect(drawQuestions([pool.slice(0, 4)], 10, seeded(3))).toHaveLength(4);
  });

  it('nel quiz completo pesca da tutti gli apparati a turno', () => {
    const groups = ['organi', 'scheletro', 'muscoli', 'nervoso'].map((t) =>
      Array.from({ length: 16 }, (_, i) => q(`${t}-${i}`, t)),
    );
    const drawn = drawQuestions(groups, 20, seeded(7));
    const perTheme = new Map<string, number>();
    for (const d of drawn) perTheme.set(d.tema, (perTheme.get(d.tema) ?? 0) + 1);
    expect([...perTheme.values()]).toEqual([5, 5, 5, 5]);
  });

  it('collega i temi dei contenuti agli strati della barra', () => {
    expect(layerOfQuizTheme('cardiocircolatorio')).toBe('vasi');
    expect(quizSlugs('nervi', ['nervoso', 'organi'])).toEqual(['nervoso']);
    expect(quizSlugs('muscoli', ['organi'])).toEqual([]);
    expect(quizSlugs('completa', ['organi', 'nervoso'])).toEqual(['organi', 'nervoso']);
  });
});

describe('regole del quiz', () => {
  it('senza 3D toglie le domande "indica"', () => {
    const point = { ...q('indica'), tipo: 'indica' as const };
    expect(playableQuestions([q('testo'), point], true).map((x) => x.id)).toEqual(['testo']);
    expect(playableQuestions([q('testo'), point], false)).toHaveLength(2);
    expect(playableCount({ domande: 17, indica: 3 }, true)).toBe(14);
    expect(playableCount(undefined, false)).toBe(0);
  });

  it('il quiz completo ha un giro più lungo', () => {
    expect(roundSize('completa')).toBe(20);
    expect(roundSize('organi')).toBe(10);
  });

  it('solo le lettere A–D scelgono una risposta', () => {
    expect(['a', 'B', 'c', 'D'].map(answerIndexOfKey)).toEqual([0, 1, 2, 3]);
    expect(['1', 'e', 'Enter', 'Shift'].map(answerIndexOfKey)).toEqual([-1, -1, -1, -1]);
  });

  it('dopo la scelta segna la giusta, la sbagliata scelta e le altre', () => {
    expect(answerResult(0, 2, null)).toBeUndefined();
    expect([0, 1, 2, 3].map((i) => answerResult(i, 2, 1))).toEqual(['other', 'wrong', 'correct', 'other']);
  });
});
