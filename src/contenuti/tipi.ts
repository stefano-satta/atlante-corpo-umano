// Forma dei contenuti compilati da pipeline/contenuti.mjs.

export type Stato = 'bozza' | 'verificato' | 'approvato';

export interface Fonte {
  id: string;
  tipo: 'istituzionale' | 'manuale' | 'terminologia';
  titolo: string;
  ente?: string;
  autori?: string[];
  editore?: string;
  anno?: number;
  aggiornata?: string;
  url: string;
  consultata: string;
  nota?: string;
}

export interface FonteNumerata extends Fonte {
  n: number;
}

export interface FonteCitata extends Fonte {
  citataDa: Array<{ id: string; nome: string }>;
}

export interface Sezione {
  chiave: string;
  titolo: string;
  ancora: string;
  /** HTML prodotto in build dal Markdown dei contenuti, con i rimandi alle fonti. */
  html: string;
}

export interface Relazione {
  tipo: 'fa-parte-di' | 'collegato-a';
  id: string;
  nome: string;
  conContenuto: boolean;
  fonte: number | null;
}

/** Voce dell'indice: abbastanza per nome, termine e collegamento al modello 3D. */
export interface VoceIndice {
  id: string;
  tipo: 'organo' | 'osso' | 'muscolo';
  strato: 'organi' | 'ossa' | 'muscoli';
  apparato: string;
  nomeApparato: string;
  nome: string;
  termine: string;
  ta2: number;
  sinonimi: string[];
  elementi3d: { gruppo: string | null; fma: string[] };
  stato: Stato;
  revisione: string;
  scheda: boolean;
}

export interface Struttura extends VoceIndice {
  limiti: string | null;
  sezioni: Sezione[];
  relazioni: Relazione[];
  fonti: FonteNumerata[];
  /** Numero di fonti citate in "In breve": sono le prime della lista. */
  fontiBreve: number;
}

export interface Pagina {
  id: string;
  titolo: string;
  stato: Stato;
  revisione: string;
  html: string;
}
