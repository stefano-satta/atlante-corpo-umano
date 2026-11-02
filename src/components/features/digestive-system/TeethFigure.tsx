import { AnatomyFigure } from '@/components/features/panel/AnatomyFigure';
import type { Figure } from '@/models/content';
import { TEETH_PARTS, TeethDiagram } from './TeethDiagram';

/** Figura dei tipi di denti e della struttura di un molare nella scheda dei denti. */
export default function TeethFigure({ figure }: { figure: Figure }) {
  return (
    <AnatomyFigure figure={figure} parts={TEETH_PARTS}>
      <TeethDiagram />
    </AnatomyFigure>
  );
}
