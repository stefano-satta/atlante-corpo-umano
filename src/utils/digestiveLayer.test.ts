import { describe, expect, it } from 'vitest';
import units from '../../public/modelli/strutture.json';
import { DIGESTIVE_ORGANS, GHOST_MODEL_LAYERS, VISIBLE_MODEL_LAYERS, VISIBLE_UNITS } from './atlasReducer';
import { STRUCTURES } from './content';

describe('apparato digerente (D48)', () => {
  it('mostra gli organi digerenti del modello, con le ossa come contesto', () => {
    const groups = new Set(units.filter((u) => u.strato === 'organi').map((u) => u.gruppo));
    for (const g of DIGESTIVE_ORGANS) expect(groups.has(g), g).toBe(true);
    expect(VISIBLE_MODEL_LAYERS.digerente).toEqual([]);
    expect(GHOST_MODEL_LAYERS.digerente).toEqual(['ossa']);
  });

  it('comprende tutti gli organi che i contenuti mettono nell’apparato digerente', () => {
    const digestive = STRUCTURES.filter((s) => s.apparato === 'digerente' && s.strato === 'organi').map(
      (s) => s.elementi3d.gruppo,
    );
    expect(digestive.sort()).toEqual([...DIGESTIVE_ORGANS].sort());
  });

  it('aggiunge i costrittori della faringe e lo sfintere esterno dell’ano', () => {
    const muscles = VISIBLE_UNITS.digerente.filter((id) => !DIGESTIVE_ORGANS.includes(id));
    const fma = muscles.map((id) => units.find((u) => u.id === id)?.fma);
    expect(new Set(fma)).toEqual(
      new Set(['FMA46631', 'FMA46632', 'FMA46633', 'FMA46634', 'FMA46635', 'FMA46636', 'FMA21930']),
    );
    expect(units.filter((u) => u.fma === 'FMA21930')).toHaveLength(3);
  });
});
