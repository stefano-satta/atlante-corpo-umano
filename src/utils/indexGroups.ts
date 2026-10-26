import type { IndexEntry, SystemGroup } from '@/models/atlasIndex';
import type { GlossaryEntry, StructureSummary } from '@/models/content';
import { GLOSSARY, STRUCTURES } from './content';
import { BODY_SYSTEM_NAMES, ORGANS } from './organs';

const ORDER = [
  'cardiovascolare',
  'respiratorio',
  'digerente',
  'urinario',
  'genitale-maschile',
  'genitale-femminile',
  'nervoso',
  'visivo',
  'endocrino',
  'linfatico',
  'scheletrico',
];

/**
 * Voci dell'Indice raggruppate per apparato (D26): gli organi del modello, con il testo quando c'è,
 * e le ossa e i muscoli che hanno un testo. Le altre ossa e gli altri muscoli restano fuori finché
 * hanno solo il nome inglese del modello. Le parti che il modello non ha (vulva, tratti
 * dell'uretra…) vengono dal glossario e stanno nell'apparato della scheda che le descrive.
 */
export function groupBySystem(
  structures: StructureSummary[] = STRUCTURES,
  glossary: GlossaryEntry[] = GLOSSARY,
): SystemGroup[] {
  const groups = new Map<string, SystemGroup>();
  const add = (system: string, name: string, entry: IndexEntry) => {
    if (!groups.has(system)) groups.set(system, { system, name, entries: [] });
    groups.get(system)?.entries.push(entry);
  };
  const used = new Set<string>();
  for (const o of ORGANS) {
    const c = structures.find((s) => s.unita === o.id);
    if (c) used.add(c.id);
    const systemName = c?.nomeApparato ?? BODY_SYSTEM_NAMES[o.system];
    add(c?.apparato ?? o.system, systemName, {
      key: o.id,
      name: c?.nome ?? o.name,
      latinTerm: c?.termine ?? o.latinTerm,
      searchTexts: [...(c?.sinonimi ?? []), systemName],
      unit: o.id,
      content: c,
    });
  }
  for (const c of structures)
    if (!used.has(c.id))
      add(c.apparato, c.nomeApparato, {
        key: c.id,
        name: c.nome,
        latinTerm: c.termine,
        searchTexts: [...c.sinonimi, c.nomeApparato],
        unit: c.unita,
        content: c,
      });
  for (const g of glossary) {
    const parent = structures.find((s) => s.id === g.parteDi);
    if (!parent || !g.latino) continue;
    add(parent.apparato, parent.nomeApparato, {
      key: `glossario-${g.id}`,
      name: g.termine.charAt(0).toUpperCase() + g.termine.slice(1),
      latinTerm: g.latino,
      searchTexts: [...g.varianti, parent.nome, parent.nomeApparato],
      unit: null,
      partOf: parent,
      glossaryTerm: g.id,
      inModel: g.nelModello,
    });
  }
  const rank = (system: string) => (ORDER.includes(system) ? ORDER.indexOf(system) : ORDER.length);
  return [...groups.values()]
    .sort((a, b) => rank(a.system) - rank(b.system) || a.name.localeCompare(b.name, 'it'))
    .map((g) => ({ ...g, entries: g.entries.sort((a, b) => a.name.localeCompare(b.name, 'it')) }));
}
