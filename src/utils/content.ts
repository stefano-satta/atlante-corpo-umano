import {
  caricaFonti,
  caricaGlossario,
  caricaPagina,
  caricaPercorso,
  caricaStruttura,
  GLOSSARIO,
  PERCORSI,
  PROCESSI,
  STRUTTURE,
} from 'virtual:contenuti';
import type { StructureSummary } from '@/models/content';

// Indice leggero dei contenuti pubblicati e caricatori dei testi completi (pipeline/plugin-contenuti.mjs).
export const STRUCTURES = STRUTTURE;
export const GUIDED_PATHS = PERCORSI;
export const PROCESSES = PROCESSI;
export const GLOSSARY = GLOSSARIO;
export const loaders = {
  structure: caricaStruttura,
  page: caricaPagina,
  guidedPath: caricaPercorso,
  glossary: caricaGlossario,
  sources: caricaFonti,
};

const byGroup = new Map<string, StructureSummary>();
const byFma = new Map<string, StructureSummary>();
const byUnitId = new Map<string, StructureSummary>();
for (const s of STRUCTURES) {
  if (s.elementi3d.gruppo) byGroup.set(s.elementi3d.gruppo, s);
  for (const fma of s.elementi3d.fma) byFma.set(fma, s);
  for (const id of s.elementi3d.id) byUnitId.set(id, s);
}

/** Contenuto associato a un'unità del modello: un organo per gruppo, un osso o un muscolo per FMA o per id. */
export function contentForUnit(unit: { id: string; layer: string; fma: string | null } | undefined) {
  if (!unit) return undefined;
  if (unit.layer === 'organi') return byGroup.get(unit.id);
  return unit.fma ? byFma.get(unit.fma) : byUnitId.get(unit.id);
}

export const hasPage = (id: string) => id in caricaPagina;
/** Una pagina del menu è disponibile: Informazioni se il suo testo è pubblicato, Glossario se ha voci. */
export const pageAvailable = (id: string) =>
  id === 'informazioni' ? hasPage(id) : id === 'glossario' ? GLOSSARY.length > 0 : true;
export const hasGuidedPath = (id: string) => id in caricaPercorso;
