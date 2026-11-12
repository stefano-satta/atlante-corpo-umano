import type { DiagramPhase } from './phases';

/** Schemi del percorso "Il giro del sangue": uno per passo (il passo nei polmoni riusa l'alveolo). */
export type CirculationDiagramId =
  | 'circuiti'
  | 'vene-cave'
  | 'cuore-destro'
  | 'cuore-sinistro'
  | 'aorta'
  | 'rene'
  | 'coronarie';

/**
 * Fasi di ogni schema, nell'ordine della riproduzione. Le etichette riassumono il testo del passo,
 * che porta le citazioni: qui non c'è nessun dato che il testo non riporti.
 */
export const CIRCULATION_PHASES: Record<CirculationDiagramId, DiagramPhase[]> = {
  circuiti: [
    { id: 'polmonare', label: 'Circolo polmonare', detail: "dal ventricolo destro ai polmoni, poi all'atrio sinistro" },
    { id: 'sistemico', label: 'Circolo sistemico', detail: "dal ventricolo sinistro ai tessuti, poi all'atrio destro" },
  ],
  'vene-cave': [
    { id: 'superiore', label: 'Vena cava superiore', detail: 'dalla parte del corpo sopra il diaframma' },
    { id: 'inferiore', label: 'Vena cava inferiore', detail: 'dalla parte del corpo sotto il diaframma' },
    { id: 'atrio', label: 'Atrio destro', detail: 'il sangue entra nel cuore' },
  ],
  'cuore-destro': [
    { id: 'tricuspide', label: 'Valvola tricuspide', detail: "dall'atrio al ventricolo destro" },
    { id: 'polmonare', label: 'Valvola polmonare', detail: 'dal ventricolo destro al tronco polmonare' },
    { id: 'arterie', label: 'Arterie polmonari', detail: 'una per polmone' },
  ],
  'cuore-sinistro': [
    { id: 'vene', label: 'Vene polmonari', detail: "quattro, verso l'atrio sinistro" },
    { id: 'mitrale', label: 'Valvola mitrale', detail: "dall'atrio al ventricolo sinistro" },
  ],
  aorta: [
    { id: 'aortica', label: 'Valvola aortica', detail: "dal ventricolo sinistro all'aorta" },
    { id: 'arco', label: 'Arco aortico', detail: 'tre rami per la testa e le braccia' },
    { id: 'discendente', label: 'Aorta toracica e addominale', detail: 'fino alle arterie iliache comuni' },
  ],
  rene: [
    { id: 'arteria', label: 'Arteria renale', detail: "dall'aorta addominale al rene" },
    { id: 'capillari', label: 'Capillari', detail: 'ossigeno e nutrienti alle cellule, scorie al sangue' },
    { id: 'vena', label: 'Vena renale', detail: 'verso la vena cava inferiore' },
    { id: 'ritorno', label: "Di nuovo all'atrio destro", detail: 'il giro è completo' },
  ],
  coronarie: [
    { id: 'arterie', label: 'Arterie coronarie', detail: "i primi rami dell'aorta" },
    { id: 'seno', label: 'Seno coronarico', detail: "versa il sangue nell'atrio destro" },
  ],
};

export const isCirculationDiagram = (schema: string): schema is CirculationDiagramId => schema in CIRCULATION_PHASES;
