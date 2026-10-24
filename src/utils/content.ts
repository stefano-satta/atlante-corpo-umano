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
for (const s of STRUCTURES) {
  if (s.elementi3d.gruppo) byGroup.set(s.elementi3d.gruppo, s);
  for (const fma of s.elementi3d.fma) byFma.set(fma, s);
}

/** Contenuto associato a un'unità del modello: un organo per gruppo, un osso o un muscolo per FMA. */
export function contentForUnit(unit: { id: string; layer: string; fma: string | null } | undefined) {
  if (!unit) return undefined;
  return unit.layer === 'organi' ? byGroup.get(unit.id) : unit.fma ? byFma.get(unit.fma) : undefined;
}

export const hasPage = (id: string) => id in caricaPagina;
export const hasGuidedPath = (id: string) => id in caricaPercorso;
