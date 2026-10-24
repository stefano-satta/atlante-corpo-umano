import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import type { ModelElement } from '@/models/scene';
import {
  calloutAnchor,
  createUnits,
  UNIT_DIMMED,
  UNIT_FULL,
  UNIT_HIDDEN,
  unitStates,
  unitsForElements,
} from './sceneModel';

const elements: ModelElement[] = [
  { id: 'FJ1', nome: 'Wall of left atrium', fma: 'FMA1', strato: 'organi', gruppo: 'cuore' },
  { id: 'FJ2', nome: 'Wall of ventricle', fma: 'FMA2', strato: 'organi', gruppo: 'cuore' },
  { id: 'FJ3', nome: 'Left femur', fma: 'FMA24475', strato: 'ossa', gruppo: null },
  { id: 'FJ4', nome: 'Right femur', fma: 'FMA24474', strato: 'ossa', gruppo: null },
];

describe('createUnits', () => {
  const units = createUnits(elements);

  it("raggruppa le parti di un organo in un'unica unità selezionabile", () => {
    expect(units.get('cuore')?.layer).toBe('organi');
    expect([...units.keys()].filter((k) => k === 'cuore')).toHaveLength(1);
  });

  it('tiene separati ossa e muscoli', () => {
    expect(units.get('FJ3')?.fmaName).toBe('Left femur');
    expect(units.get('FJ4')?.fmaName).toBe('Right femur');
  });

  it('assegna indici univoci a partire da 1 (0 significa "nessuna")', () => {
    expect([...units.values()].map((u) => u.index)).toEqual([1, 2, 3]);
  });
});

describe('calloutAnchor', () => {
  // Due blocchi separati, a sinistra e a destra di x = 0, con il davanti verso +Z.
  const positions = [-2, 0, 1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, 2, 0, 1];
  const box = new THREE.Box3().setFromArray(positions);

  it('in un organo doppio sceglie un punto della superficie, non lo spazio vuoto fra le due parti', () => {
    const normals = positions.map((_, i) => (i % 3 === 2 ? 1 : 0));
    const a = calloutAnchor(positions, normals, box, new THREE.Vector3());
    expect(Math.abs(a.x)).toBe(1);
    expect(a.z).toBe(1);
  });

  it('preferisce le facce rivolte verso chi guarda', () => {
    // I due vertici più centrali hanno la normale di lato: vince il primo rivolto in avanti.
    const normals = [0, 0, 1, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 0, 1];
    const a = calloutAnchor(positions, normals, box, new THREE.Vector3());
    expect(Math.abs(a.x)).toBe(2);
  });
});

describe('stati delle unità', () => {
  const units = createUnits(elements);
  const stateOf = (states: Uint8Array, id: string) => states[units.get(id)?.index ?? 0];

  it('senza fuoco mostra piene le unità degli strati visibili e nasconde le altre', () => {
    const states = unitStates(units, ['organi'], null);
    expect(stateOf(states, 'cuore')).toBe(UNIT_FULL);
    expect(stateOf(states, 'FJ3')).toBe(UNIT_HIDDEN);
  });

  it('con un fuoco attenua il resto e mostra anche le unità di uno strato nascosto', () => {
    const states = unitStates(units, ['organi'], new Set(['FJ3']));
    expect(stateOf(states, 'FJ3')).toBe(UNIT_FULL);
    expect(stateOf(states, 'cuore')).toBe(UNIT_DIMMED);
    expect(stateOf(states, 'FJ4')).toBe(UNIT_HIDDEN);
  });

  it('trova le unità di un contenuto per gruppo e per FMA', () => {
    expect(unitsForElements({ gruppi: ['cuore', 'inesistente'], fma: ['FMA24474'] }, units)).toEqual(['cuore', 'FJ4']);
  });
});
