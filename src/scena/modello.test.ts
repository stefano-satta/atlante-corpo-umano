import { describe, expect, it } from 'vitest';
import { creaUnita, type Elemento } from './modello';

const elementi: Elemento[] = [
  { id: 'FJ1', nome: 'Wall of left atrium', fma: 'FMA1', strato: 'organi', gruppo: 'cuore' },
  { id: 'FJ2', nome: 'Wall of ventricle', fma: 'FMA2', strato: 'organi', gruppo: 'cuore' },
  { id: 'FJ3', nome: 'Left femur', fma: 'FMA24475', strato: 'ossa', gruppo: null },
  { id: 'FJ4', nome: 'Right femur', fma: 'FMA24474', strato: 'ossa', gruppo: null },
];

describe('creaUnita', () => {
  const unita = creaUnita(elementi);

  it("raggruppa le parti di un organo in un'unica unità selezionabile", () => {
    expect(unita.get('cuore')?.strato).toBe('organi');
    expect([...unita.keys()].filter((k) => k === 'cuore')).toHaveLength(1);
  });

  it('tiene separati ossa e muscoli', () => {
    expect(unita.get('FJ3')?.nomeFma).toBe('Left femur');
    expect(unita.get('FJ4')?.nomeFma).toBe('Right femur');
  });

  it('assegna indici univoci a partire da 1 (0 significa "nessuna")', () => {
    const indici = [...unita.values()].map((u) => u.indice);
    expect(indici).toEqual([1, 2, 3]);
  });
});
