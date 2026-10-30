import { describe, expect, it } from 'vitest';
import type { GlossaryEntry, StructureSummary } from '@/models/content';
import { alphabet, areaOf, byInitial, GENERAL_AREA, glossaryAreas } from './glossaryGroups';

const structure = (id: string, apparato: string, nomeApparato: string) =>
  ({ id, apparato, nomeApparato }) as StructureSummary;
const entry = (id: string, termine: string, parteDi: string | null = null) =>
  ({ id, termine, varianti: [], latino: null, ta2: null, parteDi, nelModello: false }) as GlossaryEntry;

const structures = [
  structure('occhi', 'visivo', 'Apparato visivo'),
  structure('vagina', 'genitale-femminile', 'Apparato genitale femminile'),
];
const glossary = [
  entry('iride', 'iride', 'occhi'),
  entry('alveolo', 'alveolo'),
  entry('imene', 'imene', 'vagina'),
  entry('cornea', 'cornea', 'occhi'),
];

describe('glossario', () => {
  it("una parte sta nell'apparato della sua scheda, le altre voci tra i termini generali", () => {
    expect(areaOf(glossary[0], structures)).toBe('visivo');
    expect(areaOf(glossary[1], structures)).toBe(GENERAL_AREA);
  });

  it("i filtri mettono prima i termini generali, poi gli apparati nell'ordine dell'Indice, con nomi brevi", () => {
    expect(glossaryAreas(glossary, structures)).toEqual([
      { id: GENERAL_AREA, name: 'Termini generali', count: 1 },
      { id: 'genitale-femminile', name: 'Genitale femminile', count: 1 },
      { id: 'visivo', name: 'Visivo', count: 2 },
    ]);
  });

  it('divide le voci per iniziale, senza accenti e in ordine alfabetico', () => {
    const groups = byInitial([...glossary, entry('ugola', 'Úgola')]);
    expect(groups.map((g) => g.letter)).toEqual(['A', 'C', 'I', 'U']);
    expect(groups[2].entries.map((e) => e.termine)).toEqual(['imene', 'iride']);
  });

  it("la barra delle lettere ha l'alfabeto italiano e le lettere straniere usate", () => {
    expect(alphabet([entry('x', 'xifoide')])).toContain('X');
    expect(alphabet([])).not.toContain('J');
    expect(alphabet([])).toHaveLength(21);
  });
});
