import type { Box3, Vector3 } from 'three';

/** Strato del modello 3D: un file .glb per ciascuno. I valori sono quelli di strutture.json. */
export type ModelLayer = 'ossa' | 'muscoli' | 'organi' | 'pelle';

/** Una riga di strutture.json, prodotto da pipeline/prepara-modelli.mjs. */
export interface ModelElement {
  id: string;
  nome: string;
  fma: string | null;
  strato: ModelLayer;
  gruppo: string | null;
}

/** Ciò che l'utente seleziona: un organo intero, oppure un singolo osso o muscolo. */
export interface SceneUnit {
  index: number;
  id: string;
  layer: ModelLayer;
  fmaName: string;
  fma: string | null;
  box: Box3;
  /** Punto della superficie a cui arriva la linea di richiamo (vedi `calloutAnchor`). */
  anchor: Vector3;
}
