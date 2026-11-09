import { CORPO_UNITA, UNITA_MUSCOLI, UNITA_NERVI, UNITA_VASI } from 'virtual:contenuti/modello';
import type { BodyKind } from '@/models/atlas';
import type { LazyModelLayer } from '@/models/scene';

// Indice leggero del modello 3D, generato da pipeline/plugin-contenuti.mjs: serve prima che la scena
// e strutture.json siano scaricati, per esempio aprendo l'indirizzo di un muscolo, di un vaso o di un nervo.
const LAZY_UNITS = new Map<string, LazyModelLayer>([
  ...UNITA_MUSCOLI.map((id) => [id, 'muscoli'] as const),
  ...UNITA_VASI.map((id) => [id, 'vasi'] as const),
  ...UNITA_NERVI.map((id) => [id, 'nervi'] as const),
]);
const SINGLE_BODY_UNITS = new Map<string, BodyKind>(Object.entries(CORPO_UNITA));

/** Strato a parte (muscoli, vasi o nervi) che contiene un'unità, se non è in uno dei file scaricati all'avvio. */
export const lazyLayerOf = (id: string) => LAZY_UNITS.get(id);

/** Corpo in cui si vede un'unità, se non è comune ai due (D29). */
export const singleBodyOf = (id: string) => SINGLE_BODY_UNITS.get(id);
