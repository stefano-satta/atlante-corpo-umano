import { describe, expect, it } from 'vitest';
import type { Structure } from '@/models/content';
import {
  GHOST_MODEL_LAYERS,
  REPRODUCTIVE_ORGANS,
  URINARY_ORGANS,
  VISIBLE_MODEL_LAYERS,
  VISIBLE_UNITS,
} from '@/utils/atlasReducer';
import { loaders, STRUCTURES } from '@/utils/content';
import units from '../../../public/modelli/strutture.json';

const groups = new Set(units.filter((u) => u.strato === 'organi').map((u) => u.gruppo));
const partOf = async (id: string) =>
  ((await loaders.structure[id]()).default as Structure).relazioni
    .filter((r) => r.tipo === 'fa-parte-di')
    .map((r) => r.id);

describe('apparati urinario e riproduttivo (D51)', () => {
  it('mostrano solo i loro organi del modello, con le ossa come contesto', () => {
    for (const g of [...URINARY_ORGANS, ...REPRODUCTIVE_ORGANS]) expect(groups.has(g), g).toBe(true);
    for (const layer of ['urinario', 'riproduttivo'] as const) {
      expect(VISIBLE_MODEL_LAYERS[layer]).toEqual([]);
      expect(GHOST_MODEL_LAYERS[layer]).toEqual(['ossa']);
    }
    expect(VISIBLE_UNITS.urinario).toEqual(URINARY_ORGANS);
    expect(VISIBLE_UNITS.riproduttivo).toEqual(REPRODUCTIVE_ORGANS);
  });

  it('comprendono gli organi che i contenuti mettono in ciascun apparato', async () => {
    const organs = await Promise.all(
      STRUCTURES.filter((s) => s.strato === 'organi').map(async (s) => ({
        gruppo: s.elementi3d.gruppo,
        parti: await partOf(s.id),
      })),
    );
    const urinary = organs.filter((o) => o.parti.includes('apparato-urinario')).map((o) => o.gruppo);
    const reproductive = organs
      .filter((o) => o.parti.some((p) => p.startsWith('apparato-genitale-')))
      .map((o) => o.gruppo);
    expect(urinary.sort()).toEqual([...URINARY_ORGANS].sort());
    expect(reproductive.sort()).toEqual([...REPRODUCTIVE_ORGANS].sort());
  });

  it("l'uretra, l'organo comune ai due apparati, dichiara di far parte di entrambi", async () => {
    const shared = URINARY_ORGANS.filter((id) => REPRODUCTIVE_ORGANS.includes(id));
    expect(shared).toEqual(['uretra']);
    expect(await partOf('uretra')).toEqual(['apparato-urinario', 'apparato-genitale-maschile']);
  });
});
