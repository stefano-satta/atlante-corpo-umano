// Moduli generati in build da pipeline/plugin-contenuti.mjs.

declare module 'virtual:contenuti' {
  import type {
    DefinizioneGlossario,
    FonteCitata,
    Pagina,
    Percorso,
    Struttura,
    VoceGlossario,
    VoceIndice,
    VocePercorso,
    VoceProcesso,
  } from './tipi';
  export const STRUTTURE: VoceIndice[];
  export const caricaStruttura: Record<string, () => Promise<{ default: Struttura }>>;
  export const caricaPagina: Record<string, () => Promise<{ default: Pagina }>>;
  export const PERCORSI: VocePercorso[];
  export const caricaPercorso: Record<string, () => Promise<{ default: Percorso }>>;
  export const PROCESSI: VoceProcesso[];
  export const GLOSSARIO: VoceGlossario[];
  export const caricaGlossario: () => Promise<{ default: DefinizioneGlossario[] }>;
  export const caricaFonti: () => Promise<{ default: FonteCitata[] }>;
}
