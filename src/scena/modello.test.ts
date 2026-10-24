import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  ATTENUATA,
  ancoraRichiamo,
  creaUnita,
  type Elemento,
  NASCOSTA,
  PIENA,
  statiUnita,
  unitaPerElementi,
} from './modello';

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

describe('ancoraRichiamo', () => {
  // Due blocchi separati, a sinistra e a destra di x = 0, con il davanti verso +Z.
  const posizioni = [-2, 0, 1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, 2, 0, 1];
  const box = new THREE.Box3().setFromArray(posizioni);

  it('in un organo doppio sceglie un punto della superficie, non lo spazio vuoto fra le due parti', () => {
    const normali = posizioni.map((_, i) => (i % 3 === 2 ? 1 : 0));
    const a = ancoraRichiamo(posizioni, normali, box, new THREE.Vector3());
    expect(Math.abs(a.x)).toBe(1);
    expect(a.z).toBe(1);
  });

  it('preferisce le facce rivolte verso chi guarda', () => {
    // I due vertici più centrali hanno la normale di lato: vince il primo rivolto in avanti.
    const normali = [0, 0, 1, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 0, 1];
    const a = ancoraRichiamo(posizioni, normali, box, new THREE.Vector3());
    expect(Math.abs(a.x)).toBe(2);
  });
});

describe('stati delle unità', () => {
  const unita = creaUnita(elementi);
  const stato = (stati: Uint8Array, id: string) => stati[unita.get(id)?.indice ?? 0];

  it('senza fuoco mostra piene le unità degli strati visibili e nasconde le altre', () => {
    const stati = statiUnita(unita, ['organi'], null);
    expect(stato(stati, 'cuore')).toBe(PIENA);
    expect(stato(stati, 'FJ3')).toBe(NASCOSTA);
  });

  it('con un fuoco attenua il resto e mostra anche le unità di uno strato nascosto', () => {
    const stati = statiUnita(unita, ['organi'], new Set(['FJ3']));
    expect(stato(stati, 'FJ3')).toBe(PIENA);
    expect(stato(stati, 'cuore')).toBe(ATTENUATA);
    expect(stato(stati, 'FJ4')).toBe(NASCOSTA);
  });

  it('trova le unità di un contenuto per gruppo e per FMA', () => {
    expect(unitaPerElementi({ gruppi: ['cuore', 'inesistente'], fma: ['FMA24474'] }, unita)).toEqual(['cuore', 'FJ4']);
  });
});
