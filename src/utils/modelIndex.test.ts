import { describe, expect, it } from 'vitest';
import { bodyFor, needsVessels } from './atlasReducer';
import { isVesselUnit, singleBodyOf } from './modelIndex';

describe('indice del modello', () => {
  it('riconosce i vasi dai dati del modello', () => {
    expect(isVesselUnit('vaso-right-anterior-cerebral-artery')).toBe(true);
    expect(isVesselUnit('vaso-che-non-esiste')).toBe(false);
    expect(isVesselUnit('cuore')).toBe(false);
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

  it('scarica i vasi per lo strato o per un vaso selezionato', () => {
    expect(needsVessels('vasi', null)).toBe(true);
    expect(needsVessels('organi', 'vaso-right-anterior-cerebral-artery')).toBe(true);
    expect(needsVessels('organi', 'cuore')).toBe(false);
    expect(needsVessels('organi', null)).toBe(false);
  });
});
