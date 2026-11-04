import type { DigestionDiagramId } from '@/models/digestion';
import { ColonDiagram } from './ColonDiagram';
import { DuodenumDiagram } from './DuodenumDiagram';
import type { DiagramProps } from './diagramParts';
import { MouthDiagram } from './MouthDiagram';
import { RectumDiagram } from './RectumDiagram';
import { StomachDiagram } from './StomachDiagram';
import { SwallowDiagram } from './SwallowDiagram';
import { TractDiagram } from './TractDiagram';
import { VillusDiagram } from './VillusDiagram';

// Schemi del percorso "Il viaggio del cibo", disegnati per l'atlante. Il corpo intero, lo stomaco,
// il duodeno e il colon sono visti di fronte (il lato destro del corpo è a sinistra di chi guarda);
// bocca e gola sono viste di lato, con il viso a sinistra. Forme e proporzioni non sono in scala, e
// lo dichiara l'avvertenza sotto il disegno. Ogni schema riceve la fase e la mostra con attributi
// data-* e posizioni calcolate qui; il movimento tra una fase e l'altra è affidato al CSS.

export const DIGESTION_DIAGRAMS: Record<DigestionDiagramId, (props: DiagramProps) => React.JSX.Element> = {
  digerente: TractDiagram,
  bocca: MouthDiagram,
  deglutizione: SwallowDiagram,
  stomaco: StomachDiagram,
  duodeno: DuodenumDiagram,
  villo: VillusDiagram,
  colon: ColonDiagram,
  retto: RectumDiagram,
};
