import { AnatomyFigure } from '@/components/features/panel/AnatomyFigure';
import type { Figure } from '@/models/content';
import { BREAST_PARTS, BreastDiagram } from './BreastDiagram';

/** Figura dell'interno della mammella nella scheda delle mammelle. */
export default function BreastFigure({ figure }: { figure: Figure }) {
  return (
    <AnatomyFigure figure={figure} parts={BREAST_PARTS}>
      <BreastDiagram />
    </AnatomyFigure>
  );
}
