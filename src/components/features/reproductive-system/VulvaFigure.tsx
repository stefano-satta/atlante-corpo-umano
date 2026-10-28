import { AnatomyFigure } from '@/components/features/panel/AnatomyFigure';
import type { Figure } from '@/models/content';
import { VULVA_PARTS, VulvaDiagram } from './VulvaDiagram';

/** Figura dei genitali esterni nella scheda della vagina. */
export default function VulvaFigure({ figure }: { figure: Figure }) {
  return (
    <AnatomyFigure figure={figure} parts={VULVA_PARTS}>
      <VulvaDiagram />
    </AnatomyFigure>
  );
}
