import type { Box3, Vector3 } from 'three';
import type { BodyKind } from './atlas';

/** Strato del modello 3D: un file .glb per ciascuno. I valori sono quelli di strutture.json. */
export type ModelLayer = 'ossa' | 'muscoli' | 'organi' | 'pelle';

/** Una riga di strutture.json, prodotto da pipeline/prepara-modelli.mjs. */
export interface ModelElement {
  id: string;
  nome: string;
  fma: string | null;
  strato: ModelLayer;
  gruppo: string | null;
  /** Presente solo per gli organi di un solo corpo (D29). */
  corpo?: BodyKind;
}

/** Ciò che l'utente seleziona: un organo intero, oppure un singolo osso o muscolo. */
export interface SceneUnit {
  index: number;
  id: string;
  layer: ModelLayer;
  /** Corpo in cui l'unità si vede; null se è comune ai due. */
  body: BodyKind | null;
  fmaName: string;
  fma: string | null;
  box: Box3;
  /** Punto della superficie a cui arriva la linea di richiamo (vedi `calloutAnchor`). */
  anchor: Vector3;
}
