import { describe, expect, it } from 'vitest';
import { angoloRotazione, applica, icp, similitudine } from './geometria.mjs';

// Rotazione di 10° attorno all'asse X, scala 0,8 e traslazione nota.
const th = (10 * Math.PI) / 180;
const NOTA = {
  R: [
    [1, 0, 0],
    [0, Math.cos(th), -Math.sin(th)],
    [0, Math.sin(th), Math.cos(th)],
  ],
  s: 0.8,
  t: [0.01, 0.8, 0.13],
};
// Nuvola irregolare, così che la corrispondenza per punto più vicino sia univoca.
const punti = Array.from({ length: 300 }, (_, i) => [
  Math.sin(i * 1.3) * 0.1,
  Math.cos(i * 0.7) * 0.08 + (i % 7) * 0.003,
  Math.sin(i * 0.37) * 0.05,
]);

describe('similitudine (Umeyama)', () => {
  it('ritrova scala, rotazione e traslazione da punti corrispondenti', () => {
    const T = similitudine(
      punti,
      punti.map((p) => applica(NOTA, p)),
    );
    expect(T.s).toBeCloseTo(0.8, 6);
    expect(angoloRotazione(T.R)).toBeCloseTo(10, 4);
    for (let k = 0; k < 3; k++) expect(T.t[k]).toBeCloseTo(NOTA.t[k], 6);
  });

  it('con soloTraslazione tiene scala e rotazione della base', () => {
    const base = { ...NOTA, t: [0, 0, 0] };
    const T = similitudine(
      punti,
      punti.map((p) => applica(NOTA, p)),
      { soloTraslazione: true, base },
    );
    expect(T.s).toBe(0.8);
    for (let k = 0; k < 3; k++) expect(T.t[k]).toBeCloseTo(NOTA.t[k], 9);
  });
});

describe('icp', () => {
  it('allinea due nuvole senza corrispondenze note, partendo da centroidi e dispersione', () => {
    const { T, scarto } = icp([[punti, punti.map((p) => applica(NOTA, p))]]);
    expect(scarto).toBeLessThan(1e-4);
    expect(T.s).toBeCloseTo(0.8, 3);
  });
});
