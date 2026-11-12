import type { UrinaryPhase } from './content';
import type { DiagramPhase } from './phases';

/**
 * Schemi del percorso "Come si forma l'urina": riusano il disegno dell'apparato urinario della
 * scheda degli organi urinari, ciascuno con le fasi del suo passo (il primo le mostra tutte).
 */
export type UrinePathDiagramId =
  | 'urina'
  | 'urina-filtrazione'
  | 'urina-riassorbimento'
  | 'urina-ureteri'
  | 'urina-riempimento'
  | 'urina-minzione';

/** Fasi del disegno, con le etichette tratte dal testo dei passi, che porta le citazioni. */
const PHASES: Record<UrinaryPhase, DiagramPhase & { id: UrinaryPhase }> = {
  filtrazione: { id: 'filtrazione', label: 'I reni filtrano il sangue', detail: 'nei glomeruli dei nefroni' },
  riassorbimento: {
    id: 'riassorbimento',
    label: 'Quasi tutto torna nel sangue',
    detail: 'di circa 140 litri filtrati al giorno, 1-2 diventano urina',
  },
  ureteri: { id: 'ureteri', label: 'Gli ureteri', detail: "la peristalsi spinge l'urina verso la vescica" },
  riempimento: { id: 'riempimento', label: 'La vescica si riempie', detail: "gli sfinteri trattengono l'urina" },
  minzione: { id: 'minzione', label: "L'urina esce", detail: 'gli sfinteri si rilassano e la vescica si contrae' },
};

export const URINE_PATH_PHASES: Record<UrinePathDiagramId, DiagramPhase[]> = {
  urina: Object.values(PHASES),
  'urina-filtrazione': [PHASES.filtrazione],
  'urina-riassorbimento': [PHASES.riassorbimento],
  'urina-ureteri': [PHASES.ureteri],
  'urina-riempimento': [PHASES.riempimento],
  'urina-minzione': [PHASES.minzione],
};

export const isUrinePathDiagram = (schema: string): schema is UrinePathDiagramId => schema in URINE_PATH_PHASES;
