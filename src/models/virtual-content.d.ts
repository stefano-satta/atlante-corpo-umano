// Moduli generati in build da pipeline/plugin-contenuti.mjs.

declare module 'virtual:contenuti' {
  import type {
    CitedSource,
    GlossaryDefinition,
    GlossaryEntry,
    GuidedPath,
    GuidedPathSummary,
    Page,
    ProcessSummary,
    Structure,
    StructureSummary,
  } from '@/models/content';
  export const STRUTTURE: StructureSummary[];
  export const caricaStruttura: Record<string, () => Promise<{ default: Structure }>>;
  export const caricaPagina: Record<string, () => Promise<{ default: Page }>>;
  export const PERCORSI: GuidedPathSummary[];
  export const caricaPercorso: Record<string, () => Promise<{ default: GuidedPath }>>;
  export const PROCESSI: ProcessSummary[];
  export const GLOSSARIO: GlossaryEntry[];
  export const caricaGlossario: () => Promise<{ default: GlossaryDefinition[] }>;
  export const caricaFonti: () => Promise<{ default: CitedSource[] }>;
}

declare module 'virtual:contenuti/modello' {
  import type { BodyKind } from '@/models/atlas';
  export const UNITA_VASI: string[];
  export const UNITA_NERVI: string[];
  export const CORPO_UNITA: Record<string, BodyKind>;
}
