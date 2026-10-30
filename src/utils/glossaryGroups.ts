import type { GlossaryEntry, StructureSummary } from '@/models/content';
import { GLOSSARY, STRUCTURES } from './content';
import { SYSTEM_ORDER } from './indexGroups';
import { normalize } from './search';

/** Area delle voci senza `parteDi`: i termini che i testi usano in più apparati. */
export const GENERAL_AREA = 'generale';

export interface GlossaryArea {
  id: string;
  name: string;
  count: number;
}

/** Apparato della scheda che descrive la parte (`parteDi`), oppure l'area dei termini generali. */
export function areaOf(entry: GlossaryEntry, structures: StructureSummary[] = STRUCTURES) {
  const parent = structures.find((s) => s.id === entry.parteDi);
  return parent ? parent.apparato : GENERAL_AREA;
}

/**
 * Filtri del Glossario: i termini generali, poi gli apparati nell'ordine dell'Indice. Il nome è
 * breve ("Visivo", "Genitale femminile") perché sta in un pulsante.
 */
export function glossaryAreas(
  glossary: GlossaryEntry[] = GLOSSARY,
  structures: StructureSummary[] = STRUCTURES,
): GlossaryArea[] {
  const areas = new Map<string, GlossaryArea>();
  for (const g of glossary) {
    const parent = structures.find((s) => s.id === g.parteDi);
    const id = parent?.apparato ?? GENERAL_AREA;
    const name = parent ? shortSystemName(parent.nomeApparato) : 'Termini generali';
    const area = areas.get(id) ?? { id, name, count: 0 };
    area.count++;
    areas.set(id, area);
  }
  const rank = (id: string) => (id === GENERAL_AREA ? -1 : SYSTEM_ORDER.indexOf(id) + 1 || SYSTEM_ORDER.length + 1);
  return [...areas.values()].sort((a, b) => rank(a.id) - rank(b.id) || a.name.localeCompare(b.name, 'it'));
}

function shortSystemName(name: string) {
  const short = name.replace(/^(Apparato|Sistema) /, '');
  return short.charAt(0).toUpperCase() + short.slice(1);
}

/** Iniziale di un termine per l'elenco alfabetico: maiuscola e senza accento. */
export function initialOf(term: string) {
  return normalize(term).charAt(0).toUpperCase();
}

/** Voci divise per iniziale, in ordine alfabetico italiano. */
export function byInitial<T extends { termine: string }>(entries: T[]) {
  const sorted = [...entries].sort((a, b) => a.termine.localeCompare(b.termine, 'it'));
  const letters = new Map<string, T[]>();
  for (const e of sorted) letters.set(initialOf(e.termine), [...(letters.get(initialOf(e.termine)) ?? []), e]);
  return [...letters].map(([letter, items]) => ({ letter, entries: items }));
}

/** Lettere della barra A–Z: l'alfabeto italiano, più le lettere straniere che il glossario usa. */
export function alphabet(glossary: { termine: string }[] = GLOSSARY) {
  const letters = new Set('ABCDEFGHILMNOPQRSTUVZ');
  for (const g of glossary) letters.add(initialOf(g.termine));
  return [...letters].sort();
}
