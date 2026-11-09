import { describe, expect, it } from 'vitest';
import { GHOST_MODEL_LAYERS, RESPIRATORY_ORGANS, VISIBLE_MODEL_LAYERS, VISIBLE_UNITS } from '@/utils/atlasReducer';
import { STRUCTURES } from '@/utils/content';
import units from '../../../public/modelli/strutture.json';

describe('apparato respiratorio (D49)', () => {
  it('mostra gli organi respiratori del modello, con le ossa come contesto', () => {
    const groups = new Set(units.filter((u) => u.strato === 'organi').map((u) => u.gruppo));
    for (const g of RESPIRATORY_ORGANS) expect(groups.has(g), g).toBe(true);
    expect(VISIBLE_MODEL_LAYERS.respiratorio).toEqual([]);
    expect(GHOST_MODEL_LAYERS.respiratorio).toEqual(['ossa']);
  });

  it('comprende tutti gli organi che i contenuti mettono nell’apparato respiratorio', () => {
    const respiratory = STRUCTURES.filter((s) => s.apparato === 'respiratorio' && s.strato === 'organi').map(
      (s) => s.elementi3d.gruppo,
    );
    expect(respiratory.sort()).toEqual([...RESPIRATORY_ORGANS].sort());
  });

  it('aggiunge diaframma, intercostali esterni, ossa nasali e cornetti nasali inferiori', () => {
    const others = VISIBLE_UNITS.respiratorio.filter((id) => !RESPIRATORY_ORGANS.includes(id) && !id.startsWith('ZA-'));
    const fma = others.map((id) => units.find((u) => u.id === id)?.fma);
    expect(new Set(fma)).toEqual(new Set(['FMA13295', 'FMA9756', 'FMA53647', 'FMA53648', 'FMA54737', 'FMA54738']));
    // Ogni unità del modello di queste strutture è compresa.
    expect(units.filter((u) => fma.includes(u.fma))).toHaveLength(others.length);
  });

  it('aggiunge le cinque cartilagini del naso di Z-Anatomy, nello strato delle ossa (D50)', () => {
    const cartilages = units.filter((u) => /cartilage/.test(u.nome) && u.id.startsWith('ZA-'));
    expect(cartilages.map((u) => u.strato)).toEqual(Array(5).fill('ossa'));
    for (const u of cartilages) expect(VISIBLE_UNITS.respiratorio).toContain(u.id);
  });
});
