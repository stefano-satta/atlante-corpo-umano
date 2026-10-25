// Forma dei contenuti compilati da pipeline/contenuti.mjs. I nomi dei campi seguono lo schema
// dei file in contenuti/ (D17), scritto in italiano: qui sono dati, come la risposta di un'API.

export type ContentStatus = 'bozza' | 'verificato' | 'approvato';

export interface Source {
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

export interface NumberedSource extends Source {
  n: number;
}

export interface CitedSource extends Source {
  citataDa: Array<{ id: string; nome: string }>;
}

export interface Section {
  chiave: string;
  titolo: string;
  ancora: string;
  /** HTML prodotto in build dal Markdown dei contenuti, con i rimandi alle fonti. */
  html: string;
}

export interface Relation {
  tipo: 'fa-parte-di' | 'collegato-a';
  id: string;
  nome: string;
  conContenuto: boolean;
  fonte: number | null;
}

/** Voce dell'indice: abbastanza per nome, termine e collegamento al modello 3D. */
export interface StructureSummary {
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
  /** Unità del modello da selezionare per mostrare la struttura. */
  unita: string | null;
  stato: ContentStatus;
  revisione: string;
  scheda: boolean;
}

/** Un passo di un processo animato: didascalia con rimandi e stato del disegno. */
/** Passo del ciclo cardiaco: lo stato del disegno del cuore. */
export interface ProcessStep {
  titolo: string;
  html: string;
  atri: 'rilassati' | 'contratti';
  ventricoli: 'rilassati' | 'contratti';
  /** Valvole tra atri e ventricoli (tricuspide e mitrale). */
  av: 'aperte' | 'chiuse';
  /** Valvole polmonare e aortica. */
  semilunari: 'aperte' | 'chiuse';
  segnale: 'nessuno' | 'senoatriale' | 'atrioventricolare' | 'ventricoli';
  tono: 'nessuno' | 'primo' | 'secondo';
  flussi: Array<'vene-atri' | 'atri-ventricoli' | 'ventricoli-arterie'>;
}

export type ReproductivePhase =
  | 'spermatogenesi'
  | 'maturazione'
  | 'trasporto'
  | 'liquidi'
  | 'eiaculazione'
  | 'follicolo'
  | 'ovulazione'
  | 'tuba'
  | 'endometrio'
  | 'mestruazioni';

/** Passo di uno schema di apparato: la fase che il disegno mostra. */
export interface PhaseStep {
  titolo: string;
  html: string;
  fase: ReproductivePhase;
}

interface ProcessBase {
  id: string;
  titolo: string;
  /** Struttura da cui l'Indice apre il processo. */
  principale: string;
  stato: ContentStatus;
  revisione: string;
}

export type HeartProcess = ProcessBase & { schema: 'cuore'; passi: ProcessStep[] };
export type ReproductiveProcess = ProcessBase & {
  schema: 'genitale-maschile' | 'genitale-femminile';
  passi: PhaseStep[];
};
export type Process = HeartProcess | ReproductiveProcess;

export interface Structure extends StructureSummary {
  limiti: string | null;
  sezioni: Section[];
  relazioni: Relation[];
  processi: Process[];
  fonti: NumberedSource[];
  /** Numero di fonti citate in "In breve": sono le prime della lista. */
  fontiBreve: number;
}

export interface Page {
  id: string;
  titolo: string;
  stato: ContentStatus;
  revisione: string;
  html: string;
}

/** Strutture del modello 3D: organi per gruppo, ossa e muscoli per FMA. */
export interface ModelElements {
  gruppi: string[];
  fma: string[];
}

export type PathDiagram = 'nessuno' | 'torace' | 'inspirazione' | 'espirazione' | 'alveolo';

/** Un passo di un percorso guidato (D24). */
export interface GuidedPathStep {
  titolo: string;
  html: string;
  strato: 'muscoli' | 'organi' | 'scheletro';
  /** Strutture mostrate piene; quelle di un altro strato si aggiungono alla vista. */
  evidenzia: ModelElements;
  /** Strutture da inquadrare, se diverse da quelle evidenziate. */
  inquadra: ModelElements | null;
  schema: PathDiagram;
}

export interface GuidedPathSummary {
  id: string;
  titolo: string;
  stato: ContentStatus;
  /** Numero di passi. */
  passi: number;
}

export interface GuidedPath {
  id: string;
  titolo: string;
  stato: ContentStatus;
  revisione: string;
  limiti: string | null;
  passi: GuidedPathStep[];
  fonti: NumberedSource[];
}

/** Processo animato nell'Indice: si apre nella scheda della sua struttura. */
export interface ProcessSummary {
  id: string;
  titolo: string;
  stato: ContentStatus;
  struttura: string;
}

/** Voce del glossario nell'indice leggero: basta per la ricerca e per sapere che esiste. */
export interface GlossaryEntry {
  id: string;
  termine: string;
  varianti: string[];
}

/** Voce completa del glossario (D26): definizione breve con le sue fonti. */
export interface GlossaryDefinition extends GlossaryEntry {
  html: string;
  fonti: Source[];
  stato: ContentStatus;
  revisione: string;
}
