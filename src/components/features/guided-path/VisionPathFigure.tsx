import { VisionDiagram } from '@/components/features/visual-system/VisionDiagram';
import type { VisionPhase } from '@/models/content';
import { VISION_PATH_PHASES, type VisionPathDiagramId } from '@/models/visionPath';
import { legendItem as item, type PhasedDiagramProps, PhasedFigure } from './PhasedFigure';

const FIGURE_LABELS: Record<VisionPathDiagramId, string> = {
  vista: "Schema della vista, dall'occhio alla corteccia",
  'vista-ingresso': "Schema dell'occhio: cornea, iride e pupilla",
  'vista-fuoco': "Schema dell'occhio: il cristallino mette a fuoco",
  'vista-retina': "Schema dell'occhio: la retina",
  'vista-chiasma': 'Schema delle vie ottiche: il chiasma',
  'vista-corteccia': 'Schema delle vie ottiche: la corteccia visiva',
};

const EYE_LEGEND = [item('organ-active', 'Parti al lavoro in questa fase'), item('light', 'Luce')];
const BRAIN_LEGEND = [
  item('organ-active', 'Parti al lavoro in questa fase'),
  item('field-left', 'Metà sinistra del campo visivo'),
  item('field-right', 'Metà destra del campo visivo'),
];
const LEGENDS: Record<VisionPathDiagramId, typeof EYE_LEGEND> = {
  vista: [...EYE_LEGEND, ...BRAIN_LEGEND.slice(1)],
  'vista-ingresso': EYE_LEGEND,
  'vista-fuoco': EYE_LEGEND,
  'vista-retina': EYE_LEGEND,
  'vista-chiasma': BRAIN_LEGEND,
  'vista-corteccia': BRAIN_LEGEND,
};

/** Avvertenza sotto lo schema (la stessa del processo nella scheda degli occhi). */
export const VISION_PATH_DISCLAIMER =
  "Schema semplificato: forme, distanze e tempi non sono in scala. I raggi di luce sono solo alcuni fra i tanti, e il corpo vitreo, che riempie l'occhio, è solo accennato.";

// Il disegno della vista riceve la fase; nel percorso nessuna scheda è aperta da contornare.
const Diagram = ({ phase }: PhasedDiagramProps) => <VisionDiagram phase={phase as VisionPhase} current="" />;

/** Schema di un passo di "Dalla luce all'immagine". */
export function VisionPathFigure({ schema }: { schema: VisionPathDiagramId }) {
  return (
    <PhasedFigure
      label={FIGURE_LABELS[schema]}
      className="vision-path"
      phases={VISION_PATH_PHASES[schema]}
      diagram={Diagram}
      legend={LEGENDS[schema]}
      disclaimer={VISION_PATH_DISCLAIMER}
    />
  );
}
