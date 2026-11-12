/** Una fase di uno schema animato di percorso, mostrata sotto il disegno. */
export interface DiagramPhase {
  id: string;
  /** Titolo breve della fase. */
  label: string;
  /** Dettaglio facoltativo: un tempo o un dato che il testo del passo riporta con la sua fonte. */
  detail?: string;
}
