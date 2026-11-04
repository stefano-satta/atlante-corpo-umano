export type BodySystem =
  | 'cardiovascolare'
  | 'nervoso'
  | 'digerente'
  | 'urinario'
  | 'respiratorio'
  | 'linfatico'
  | 'endocrino'
  | 'visivo'
  | 'uditivo'
  | 'genitale-maschile'
  | 'genitale-femminile';

/** Organo del modello 3D, con il nome italiano e il termine anatomico correnti. */
export interface Organ {
  id: string;
  name: string;
  latinTerm: string;
  system: BodySystem;
  color: string;
}
