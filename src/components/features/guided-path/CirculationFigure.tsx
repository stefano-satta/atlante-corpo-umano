import { CIRCULATION_PHASES, type CirculationDiagramId } from '@/models/circulation';
import { CirculationDiagram } from './circulation/CirculationDiagram';
import type { PhasedDiagramProps } from './PhasedFigure';
import { legendItem as item, PhasedFigure } from './PhasedFigure';

const FIGURE_LABELS: Record<CirculationDiagramId, string> = {
  circuiti: 'Schema dei due circuiti del sangue',
  'vene-cave': 'Schema delle vene cave e del cuore',
  'cuore-destro': 'Schema del cuore destro e delle arterie polmonari',
  'cuore-sinistro': 'Schema delle vene polmonari e del cuore sinistro',
  aorta: "Schema dell'aorta",
  rene: 'Schema dei vasi del rene',
  coronarie: 'Schema delle arterie coronarie e del seno coronarico',
};

const CHAMBERS_LEGEND = [
  item('poor', 'Sangue povero di ossigeno'),
  item('rich', 'Sangue ricco di ossigeno'),
  <li className="legend-item" key="tags">
    AD, VD: atrio e ventricolo destri · AS, VS: atrio e ventricolo sinistri
  </li>,
];
const VALVES_LEGEND = [...CHAMBERS_LEGEND.slice(0, 2), item('valve', 'Valvola'), CHAMBERS_LEGEND[2]];

const DISCLAIMER =
  "Schema semplificato, non in scala: il cuore è ingrandito e un solo organo, il rene, rappresenta tutti i tessuti. Il lato destro del corpo è a sinistra dell'immagine.";

/** Avvertenza sotto ogni schema; su smartphone sta nel foglio del percorso, sotto il testo. */
export const CIRCULATION_DISCLAIMERS: Record<CirculationDiagramId, string> = {
  circuiti: DISCLAIMER,
  'vene-cave': DISCLAIMER,
  'cuore-destro': DISCLAIMER,
  'cuore-sinistro': DISCLAIMER,
  aorta: DISCLAIMER,
  rene: `${DISCLAIMER} I capillari, microscopici, sono disegnati come poche anse.`,
  coronarie: `${DISCLAIMER} Le coronarie e il seno coronarico, che corrono sulla superficie del cuore, sono disegnati in modo indicativo.`,
};

// Un disegno per schema, creato una volta sola: lo stesso componente con lo schema già fissato.
const DIAGRAMS = Object.fromEntries(
  (Object.keys(CIRCULATION_PHASES) as CirculationDiagramId[]).map((schema) => [
    schema,
    (props: PhasedDiagramProps) => <CirculationDiagram schema={schema} {...props} />,
  ]),
) as Record<CirculationDiagramId, (props: PhasedDiagramProps) => React.JSX.Element>;

/** Schema animato di un passo del "Giro del sangue". */
export function CirculationFigure({ schema }: { schema: CirculationDiagramId }) {
  const withValves = schema === 'cuore-destro' || schema === 'cuore-sinistro' || schema === 'aorta';
  return (
    <PhasedFigure
      label={FIGURE_LABELS[schema]}
      className="circulation"
      phases={CIRCULATION_PHASES[schema]}
      diagram={DIAGRAMS[schema]}
      legend={withValves ? VALVES_LEGEND : CHAMBERS_LEGEND}
      disclaimer={CIRCULATION_DISCLAIMERS[schema]}
    />
  );
}
