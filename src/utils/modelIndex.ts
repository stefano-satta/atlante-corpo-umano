import { CORPO_UNITA, UNITA_VASI } from 'virtual:contenuti/modello';
import type { BodyKind } from '@/models/atlas';

// Indice leggero del modello 3D, generato da pipeline/plugin-contenuti.mjs: serve prima che la scena
// e strutture.json siano scaricati, per esempio aprendo l'indirizzo di un vaso.
const VESSEL_UNITS = new Set(UNITA_VASI);
const SINGLE_BODY_UNITS = new Map<string, BodyKind>(Object.entries(CORPO_UNITA));

export const isVesselUnit = (id: string) => VESSEL_UNITS.has(id);

/** Corpo in cui si vede un'unità, se non è comune ai due (D29). */
export const singleBodyOf = (id: string) => SINGLE_BODY_UNITS.get(id);
