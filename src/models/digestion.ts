/** Schemi del percorso "Il viaggio del cibo": uno per passo. */
export type DigestionDiagramId =
  | 'digerente'
  | 'bocca'
  | 'deglutizione'
  | 'stomaco'
  | 'duodeno'
  | 'villo'
  | 'colon'
  | 'retto';

export interface DigestionPhase {
  id: string;
  /** Titolo breve della fase, mostrato sotto il disegno. */
  label: string;
  /** Dettaglio facoltativo: un tempo o un dato che il testo del passo riporta con la sua fonte. */
  detail?: string;
}

/**
 * Fasi di ogni schema, nell'ordine della riproduzione. Le etichette riassumono il testo del passo,
 * che porta le citazioni: qui non c'è nessun dato che il testo non riporti.
 */
export const DIGESTION_PHASES: Record<DigestionDiagramId, DigestionPhase[]> = {
  digerente: [
    { id: 'bocca', label: 'Bocca', detail: 'masticazione e saliva' },
    { id: 'esofago', label: 'Esofago', detail: 'da 4 a 8 secondi' },
    { id: 'stomaco', label: 'Stomaco', detail: 'da 2 a 4 ore' },
    { id: 'tenue', label: 'Intestino tenue', detail: 'da 3 a 5 ore' },
    { id: 'crasso', label: 'Intestino crasso', detail: 'da 12 a 24 ore' },
    { id: 'retto', label: 'Retto', detail: "fino all'evacuazione" },
  ],
  bocca: [
    { id: 'masticazione', label: 'Masticazione', detail: 'i denti riducono il cibo in pezzi' },
    { id: 'saliva', label: 'Saliva', detail: 'da 1 a 1,5 litri al giorno' },
    { id: 'bolo', label: 'Il bolo', detail: 'la lingua raccoglie il cibo' },
  ],
  deglutizione: [
    { id: 'volontaria', label: 'Fase volontaria', detail: 'la lingua spinge il bolo indietro' },
    { id: 'faringea', label: 'Fase faringea', detail: "l'epiglottide chiude la trachea" },
    { id: 'esofagea', label: 'Fase esofagea', detail: 'la peristalsi spinge il bolo' },
    { id: 'sfintere', label: 'Sfintere esofageo inferiore', detail: 'si apre e si richiude' },
  ],
  stomaco: [
    { id: 'succo', label: 'Succo gastrico', detail: 'acido cloridrico e pepsina' },
    { id: 'onde', label: 'Onde di rimescolamento', detail: 'circa ogni 20 secondi' },
    { id: 'svuotamento', label: 'Svuotamento', detail: 'circa 3 mL di chimo alla volta' },
  ],
  duodeno: [
    { id: 'chimo', label: 'Arriva il chimo', detail: 'acido, dallo stomaco' },
    { id: 'bile', label: 'Bile', detail: 'la colecistochinina fa contrarre la colecisti' },
    { id: 'pancreas', label: 'Succo pancreatico', detail: 'la secretina chiama il bicarbonato' },
    { id: 'miscela', label: 'Grassi in goccioline', detail: 'e acido neutralizzato' },
  ],
  villo: [
    { id: 'orletto', label: 'Ultima digestione', detail: 'sui microvilli' },
    { id: 'capillari', label: 'Zuccheri e amminoacidi', detail: 'nei capillari, verso il fegato' },
    { id: 'chilifero', label: 'Grassi', detail: 'nel vaso chilifero' },
  ],
  colon: [
    { id: 'ingresso', label: 'Il residuo entra nel cieco', detail: 'circa 500 mL al giorno' },
    { id: 'acqua', label: "Si assorbe l'acqua", detail: 'restano circa 150 mL di feci' },
    { id: 'flora', label: 'Flora batterica', detail: 'fermentazione, gas e vitamine' },
    { id: 'massa', label: 'Movimento di massa', detail: 'tre o quattro volte al giorno' },
  ],
  retto: [
    { id: 'riempimento', label: 'Il retto si riempie' },
    { id: 'riflesso', label: 'Riflesso della defecazione', detail: 'lo sfintere interno si rilassa' },
    { id: 'volonta', label: 'Controllo volontario', detail: 'lo sfintere esterno resta chiuso' },
    { id: 'evacuazione', label: 'Evacuazione', detail: 'lo sfintere esterno si rilassa' },
  ],
};

export const isDigestionDiagram = (schema: string): schema is DigestionDiagramId => schema in DIGESTION_PHASES;
