import type { VisionPhase } from './content';
import type { DiagramPhase } from './phases';

/**
 * Schemi del percorso "Dalla luce all'immagine": riusano il disegno della vista della scheda degli
 * occhi, ciascuno con le fasi del suo passo (il primo le mostra tutte).
 */
export type VisionPathDiagramId =
  | 'vista'
  | 'vista-ingresso'
  | 'vista-fuoco'
  | 'vista-retina'
  | 'vista-chiasma'
  | 'vista-corteccia';

/** Fasi del disegno, con le etichette tratte dal testo dei passi, che porta le citazioni. */
const PHASES: Record<VisionPhase, DiagramPhase & { id: VisionPhase }> = {
  cornea: { id: 'cornea', label: 'Cornea', detail: 'piega la luce' },
  pupilla: { id: 'pupilla', label: 'Iride e pupilla', detail: "l'iride dosa la luce che entra" },
  cristallino: { id: 'cristallino', label: 'Cristallino', detail: "mette a fuoco l'immagine sulla retina" },
  retina: { id: 'retina', label: 'Retina', detail: 'la luce diventa un segnale elettrico' },
  chiasma: { id: 'chiasma', label: 'Chiasma ottico', detail: 'le fibre della metà verso il naso si incrociano' },
  corteccia: { id: 'corteccia', label: 'Corteccia visiva', detail: 'nel lobo occipitale' },
};

export const VISION_PATH_PHASES: Record<VisionPathDiagramId, DiagramPhase[]> = {
  vista: Object.values(PHASES),
  'vista-ingresso': [PHASES.cornea, PHASES.pupilla],
  'vista-fuoco': [PHASES.cristallino],
  'vista-retina': [PHASES.retina],
  'vista-chiasma': [PHASES.chiasma],
  'vista-corteccia': [PHASES.corteccia],
};

export const isVisionPathDiagram = (schema: string): schema is VisionPathDiagramId => schema in VISION_PATH_PHASES;
