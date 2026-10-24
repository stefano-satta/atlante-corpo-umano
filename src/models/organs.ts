export type BodySystem = 'cardiovascolare' | 'nervoso' | 'digerente' | 'urinario' | 'respiratorio' | 'linfatico';

/** Organo del modello 3D, con il nome italiano e il termine anatomico correnti. */
export interface Organ {
  id: string;
  name: string;
  latinTerm: string;
  system: BodySystem;
  color: string;
}
