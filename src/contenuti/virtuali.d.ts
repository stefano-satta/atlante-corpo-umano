// Moduli generati in build da pipeline/plugin-contenuti.mjs.

declare module 'virtual:contenuti' {
  import type { FonteCitata, Pagina, Percorso, Struttura, VoceIndice, VocePercorso } from './tipi';
  export const STRUTTURE: VoceIndice[];
  export const caricaStruttura: Record<string, () => Promise<{ default: Struttura }>>;
  export const caricaPagina: Record<string, () => Promise<{ default: Pagina }>>;
  export const PERCORSI: VocePercorso[];
  export const caricaPercorso: Record<string, () => Promise<{ default: Percorso }>>;
  export const caricaFonti: () => Promise<{ default: FonteCitata[] }>;
}
