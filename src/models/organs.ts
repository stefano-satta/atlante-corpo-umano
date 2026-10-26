import type { BodyKind } from './atlas';

export type BodySystem =
  | 'cardiovascolare'
  | 'nervoso'
  | 'digerente'
  | 'urinario'
  | 'respiratorio'
  | 'linfatico'
  | 'endocrino'
  | 'visivo'
  | 'genitale-maschile'
  | 'genitale-femminile';

/** Organo del modello 3D, con il nome italiano e il termine anatomico correnti. */
export interface Organ {
  id: string;
  name: string;
  latinTerm: string;
  system: BodySystem;
  color: string;
  /** Corpo in cui l'organo si vede, se non è comune ai due (D29). */
  body?: BodyKind;
}
