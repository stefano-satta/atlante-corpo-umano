import { describe, expect, it } from 'vitest';
import type { GlossaryEntry, StructureSummary } from '@/models/content';
import { groupBySystem } from './indexGroups';

const vagina: StructureSummary = {
  id: 'vagina',
  tipo: 'organo',
  strato: 'organi',
  apparato: 'genitale-femminile',
  nomeApparato: 'Apparato genitale femminile',
  nome: 'Vagina',
  termine: 'vagina',
  ta2: 3523,
  sinonimi: [],
  elementi3d: { gruppo: 'vagina', fma: [] },
  unita: 'vagina',
  stato: 'approvato',
  revisione: '2026-10-25',
  scheda: true,
};
const entry = (id: string, extra: Partial<GlossaryEntry>): GlossaryEntry => ({
  id,
  termine: id.replace(/-/g, ' '),
  varianti: [],
  latino: null,
  ta2: null,
  parteDi: null,
  nelModello: false,
  ...extra,
});

describe('groupBySystem', () => {
  it('elenca le parti senza modello 3D nell’apparato della scheda che le descrive', () => {
    const groups = groupBySystem(
      [vagina],
      [
        entry('piccole-labbra', { latino: 'labium minus vulvae', ta2: 3553, parteDi: 'vagina', varianti: ['labbro'] }),
        entry('alveolo', {}),
        entry('orfana', { latino: 'x', ta2: 1, parteDi: 'fegato' }),
      ],
    );
    const female = groups.find((g) => g.system === 'genitale-femminile');
    const part = female?.entries.find((e) => e.glossaryTerm === 'piccole-labbra');
    expect(part).toMatchObject({
      name: 'Piccole labbra',
      latinTerm: 'labium minus vulvae',
      unit: null,
      partOf: { id: 'vagina' },
      inModel: false,
    });
    expect(part?.searchTexts).toContain('labbro');
    const all = groups.flatMap((g) => g.entries.map((e) => e.glossaryTerm));
    expect(all).not.toContain('alveolo');
    expect(all).not.toContain('orfana');
  });

  it('segna le parti che sono nel modello 3D unite alla struttura', () => {
    const groups = groupBySystem(
      [vagina],
      [entry('parte', { latino: 'pars', ta2: 1, parteDi: 'vagina', nelModello: true })],
    );
    const entries = groups.flatMap((g) => g.entries);
    expect(entries.find((e) => e.glossaryTerm === 'parte')).toMatchObject({ inModel: true, unit: null });
  });
});
