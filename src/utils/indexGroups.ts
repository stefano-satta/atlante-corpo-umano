import type { IndexEntry, SystemGroup } from '@/models/atlasIndex';
import type { StructureSummary } from '@/models/content';
import { STRUCTURES } from './content';
import { BODY_SYSTEM_NAMES, ORGANS } from './organs';

const ORDER = ['cardiovascolare', 'respiratorio', 'digerente', 'urinario', 'nervoso', 'linfatico', 'scheletrico'];

/**
 * Voci dell'Indice raggruppate per apparato (D26): gli organi del modello, con il testo quando c'è,
 * e le ossa e i muscoli che hanno un testo. Le altre ossa e gli altri muscoli restano fuori finché
 * hanno solo il nome inglese del modello.
 */
export function groupBySystem(structures: StructureSummary[] = STRUCTURES): SystemGroup[] {
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
  const rank = (system: string) => (ORDER.includes(system) ? ORDER.indexOf(system) : ORDER.length);
  return [...groups.values()]
    .sort((a, b) => rank(a.system) - rank(b.system) || a.name.localeCompare(b.name, 'it'))
    .map((g) => ({ ...g, entries: g.entries.sort((a, b) => a.name.localeCompare(b.name, 'it')) }));
}
