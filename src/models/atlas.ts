// Stato dell'atlante: cosa si vede, cosa è selezionato e quale lettura è aperta.

/** Strato mostrato dalla barra dei comandi. I valori sono quelli dei passi di percorso nei contenuti. */
export type Layer = 'muscoli' | 'organi' | 'scheletro';

/** Pagina di lettura; il valore è anche il suo indirizzo (`/indice`, `/fonti`, `/informazioni`). */
export type PageId = 'indice' | 'fonti' | 'informazioni';

export interface ActiveGuidedPath {
  id: string;
  /** Passo contato da 0. */
  step: number;
}

export interface AtlasState {
  layer: Layer;
  /** Sagoma della pelle visibile. */
  skin: boolean;
  /** Unità selezionata: id di un organo o di un elemento (osso, muscolo). */
  selection: string | null;
  /** Scheda completa aperta al posto del cartellino. */
  sheet: boolean;
  /** Pagina di lettura aperta sopra l'atlante (Indice, Fonti, Informazioni). */
  page: PageId | null;
  /** Soglia d'ingresso (D26) sull'indirizzo `/`; entrando nell'atlante si passa a `/esplora`. */
  home: boolean;
  /** Passo del tour iniziale in corso, contato da 0. */
  tour: number | null;
  /**
   * Percorso guidato in corso (D24). Resta attivo mentre si esplora una struttura, così si
   * può tornare al passo da cui si era partiti.
   */
  guidedPath: ActiveGuidedPath | null;
  hover: string | null;
}

/** Parte dello stato che si legge e si scrive nell'indirizzo. */
export type UrlState = Pick<AtlasState, 'selection' | 'sheet' | 'page' | 'guidedPath' | 'home'>;

export type AtlasAction =
  | { type: 'setLayer'; layer: Layer }
  /** Mostra lo strato che contiene la struttura selezionata, senza perdere la selezione (indirizzo diretto). */
  | { type: 'revealLayer'; layer: Layer }
  | { type: 'toggleSkin' }
  | { type: 'select'; id: string | null }
  | { type: 'setSheet'; open: boolean }
  | { type: 'setPage'; page: PageId | null }
  | { type: 'setGuidedPath'; guidedPath: ActiveGuidedPath | null }
  | { type: 'hover'; id: string | null }
  | { type: 'setHome'; open: boolean }
  | { type: 'setTour'; step: number | null }
  | ({ type: 'fromUrl' } & UrlState);

export type AtlasDispatch = (action: AtlasAction) => void;
