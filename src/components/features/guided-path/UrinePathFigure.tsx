import { UrinaryDiagram } from '@/components/features/urinary-system/UrinaryDiagram';
import type { BodyKind } from '@/models/atlas';
import type { UrinaryPhase } from '@/models/content';
import { URINE_PATH_PHASES, type UrinePathDiagramId } from '@/models/urinePath';
import { legendItem as item, type PhasedDiagramProps, PhasedFigure } from './PhasedFigure';

const FIGURE_LABELS: Record<UrinePathDiagramId, string> = {
  urina: "Schema dell'apparato urinario, dai reni all'uretra",
  'urina-filtrazione': "Schema dell'apparato urinario: i reni filtrano il sangue",
  'urina-riassorbimento': "Schema dell'apparato urinario: quasi tutto torna nel sangue",
  'urina-ureteri': "Schema dell'apparato urinario: gli ureteri",
  'urina-riempimento': "Schema dell'apparato urinario: la vescica si riempie",
  'urina-minzione': "Schema dell'apparato urinario: l'urina esce dall'uretra",
};

const LEGEND = [item('organ-active', 'Organi al lavoro in questa fase'), item('urine', 'Urina')];

/** Avvertenza sotto lo schema (la stessa del processo nelle schede degli organi urinari). */
export const URINE_PATH_DISCLAIMER =
  "Schema semplificato, visto di fronte: forme, proporzioni e tempi non sono in scala. Il lato destro del corpo è a sinistra dell'immagine. L'uretra femminile non è nel modello 3D.";

// Il disegno riceve la fase; nel percorso nessuna scheda è aperta da contornare. Uno per corpo:
// l'uretra è breve nella donna, lunga e attraverso prostata e pene nell'uomo.
const DIAGRAMS: Record<BodyKind, (props: PhasedDiagramProps) => React.JSX.Element> = {
  uomo: ({ phase }) => <UrinaryDiagram phase={phase as UrinaryPhase} current="" body="uomo" />,
  donna: ({ phase }) => <UrinaryDiagram phase={phase as UrinaryPhase} current="" body="donna" />,
};

/** Schema di un passo di "Come si forma l'urina", per il corpo mostrato nell'atlante. */
export function UrinePathFigure({ schema, body }: { schema: UrinePathDiagramId; body: BodyKind }) {
  return (
    <PhasedFigure
      label={FIGURE_LABELS[schema]}
      className="urine-path"
      phases={URINE_PATH_PHASES[schema]}
      diagram={DIAGRAMS[body]}
      legend={LEGEND}
      disclaimer={URINE_PATH_DISCLAIMER}
    />
  );
}
