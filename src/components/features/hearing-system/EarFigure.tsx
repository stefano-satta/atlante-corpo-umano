import { AnatomyFigure } from '@/components/features/panel/AnatomyFigure';
import type { Figure } from '@/models/content';
import { EAR_PARTS, EarDiagram } from './EarDiagram';

/** Figura dell'interno dell'orecchio nella scheda degli orecchi. */
export default function EarFigure({ figure }: { figure: Figure }) {
  return (
    <AnatomyFigure figure={figure} parts={EAR_PARTS}>
      <EarDiagram />
    </AnatomyFigure>
  );
}
