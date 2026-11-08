import { describe, expect, it } from 'vitest';
import { bodyFor, needsModelLayer } from './atlasReducer';
import { lazyLayerOf, singleBodyOf } from './modelIndex';

describe('indice del modello', () => {
  it('riconosce i vasi e i nervi dai dati del modello', () => {
    expect(lazyLayerOf('vaso-right-anterior-cerebral-artery')).toBe('vasi');
    expect(lazyLayerOf('nervo-right-median-nerve')).toBe('nervi');
    expect(lazyLayerOf('nervo-spinal-cord')).toBe('nervi');
    expect(lazyLayerOf('vaso-che-non-esiste')).toBeUndefined();
    expect(lazyLayerOf('cuore')).toBeUndefined();
    expect(lazyLayerOf('constructor')).toBeUndefined();
  });

  it('conosce gli organi e i vasi di un solo corpo', () => {
    expect(singleBodyOf('utero')).toBe('donna');
    expect(singleBodyOf('pene')).toBe('uomo');
    expect(singleBodyOf('vaso-uomo-left-testicular-artery')).toBe('uomo');
    expect(singleBodyOf('cuore')).toBeUndefined();
  });

  it('non scambia un indirizzo per una proprietà di Object', () => {
    expect(singleBodyOf('constructor')).toBeUndefined();
    expect(bodyFor('donna', 'constructor')).toBe('donna');
  });
});

describe('uso dell’indice nello stato', () => {
  it('sceglie il corpo della struttura, altrimenti tiene quello attuale', () => {
    expect(bodyFor('uomo', 'utero')).toBe('donna');
    expect(bodyFor('donna', 'vaso-uomo-left-testicular-artery')).toBe('uomo');
    expect(bodyFor('donna', 'cuore')).toBe('donna');
    expect(bodyFor('donna', null)).toBe('donna');
  });

  it('scarica i vasi e i nervi per lo strato o per una loro struttura selezionata', () => {
    expect(needsModelLayer('vasi', 'vasi', null)).toBe(true);
    expect(needsModelLayer('vasi', 'organi', 'vaso-right-anterior-cerebral-artery')).toBe(true);
    expect(needsModelLayer('vasi', 'organi', 'cuore')).toBe(false);
    expect(needsModelLayer('vasi', 'organi', null)).toBe(false);
    expect(needsModelLayer('nervi', 'nervi', null)).toBe(true);
    expect(needsModelLayer('nervi', 'organi', 'nervo-left-sciatic-nerve')).toBe(true);
    expect(needsModelLayer('vasi', 'organi', 'nervo-left-sciatic-nerve')).toBe(false);
    expect(needsModelLayer('nervi', 'vasi', null)).toBe(false);
  });
});
