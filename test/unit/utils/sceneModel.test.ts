import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import type { ModelElement } from '@/models/scene';
import {
  calloutAnchor,
  createUnits,
  prepareLayer,
  UNIT_DIMMED,
  UNIT_FULL,
  UNIT_GHOST,
  UNIT_HIDDEN,
  unitStates,
  unitsForElements,
} from '@/utils/sceneModel';

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

  it('mostra come fantasma le unità degli strati di contesto, anche con un fuoco', () => {
    const states = unitStates(units, ['organi'], null, ['ossa']);
    expect(stateOf(states, 'cuore')).toBe(UNIT_FULL);
    expect(stateOf(states, 'FJ3')).toBe(UNIT_GHOST);
    const focused = unitStates(units, ['organi'], new Set(['FJ3']), ['ossa']);
    expect(stateOf(focused, 'FJ3')).toBe(UNIT_FULL);
    expect(stateOf(focused, 'FJ4')).toBe(UNIT_GHOST);
    expect(stateOf(focused, 'cuore')).toBe(UNIT_DIMMED);
  });

  it("nasconde gli organi dell'altro corpo, anche se sono nel fuoco (D29)", () => {
    const withBodies = createUnits([
      ...elements,
      { id: 'HRA-uterus', nome: 'Uterus', fma: null, strato: 'organi', gruppo: 'utero', corpo: 'donna' },
      { id: 'FJ3139', nome: 'Prostate', fma: null, strato: 'organi', gruppo: 'prostata', corpo: 'uomo' },
    ]);
    const of = (s: Uint8Array, id: string) => s[withBodies.get(id)?.index ?? 0];
    const man = unitStates(withBodies, ['organi'], null);
    expect([of(man, 'prostata'), of(man, 'utero'), of(man, 'cuore')]).toEqual([UNIT_FULL, UNIT_HIDDEN, UNIT_FULL]);
    const woman = unitStates(withBodies, ['organi'], new Set(['prostata']), [], 'donna');
    expect([of(woman, 'prostata'), of(woman, 'utero'), of(woman, 'cuore')]).toEqual([
      UNIT_HIDDEN,
      UNIT_DIMMED,
      UNIT_DIMMED,
    ]);
  });

  it('trova le unità di un contenuto per gruppo e per FMA', () => {
    expect(unitsForElements({ gruppi: ['cuore', 'inesistente'], fma: ['FMA24474'] }, units)).toEqual(['cuore', 'FJ4']);
  });
});

describe('prepareLayer e battito del cuore', () => {
  // Una mesh per elemento, chiamata con il suo id come nei file .glb.
  const mesh = (id: string, x: number) => {
    const g = new THREE.BoxGeometry(1, 1, 1).translate(x, 0, 0);
    const m = new THREE.Mesh(g);
    m.name = id;
    return m;
  };
  const scene = new THREE.Group().add(mesh('FJ1', 0), mesh('FJ2', 4), mesh('FJ3', 10));
  const units = createUnits(elements);
  const chambers = [new THREE.Box3(), new THREE.Box3(), new THREE.Box3()];
  const layer = prepareLayer(scene, new Map(elements.map((e) => [e.id, e])), units, chambers);

  it('segna i vertici del cuore con la loro camera e lascia a 0 gli altri', () => {
    const beat = layer?.getAttribute('aBeat');
    const values = new Set(Array.from(beat?.array ?? []));
    expect(values).toEqual(new Set([0, 1, 3]));
  });

  it('calcola il centro di ogni camera dalle sue pareti', () => {
    expect(chambers[0].getCenter(new THREE.Vector3()).x).toBeCloseTo(0);
    expect(chambers[1].isEmpty()).toBe(true);
    expect(chambers[2].getCenter(new THREE.Vector3()).x).toBeCloseTo(4);
  });
});
