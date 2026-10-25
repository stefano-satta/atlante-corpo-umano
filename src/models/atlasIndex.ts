import type { StructureSummary } from './content';

/** Una voce dell'Indice: un organo del modello o una struttura con testo, nel suo apparato. */
export interface IndexEntry {
  key: string;
  name: string;
  latinTerm: string;
  /** Altri testi su cui cercare: sinonimi e nome dell'apparato. */
  searchTexts: string[];
  /** Unità del modello da selezionare per mostrare la voce nel corpo. */
  unit: string | null;
  content?: StructureSummary;
  /** Parte senza modello 3D, descritta nella scheda di questa struttura e nel glossario. */
  partOf?: StructureSummary;
  /** Voce del glossario della parte. */
  glossaryTerm?: string;
}

export interface SystemGroup {
  system: string;
  name: string;
  entries: IndexEntry[];
}
