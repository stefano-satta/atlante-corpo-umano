import type { ReactNode } from 'react';
import { DIGESTION_PHASES, type DigestionDiagramId } from '@/models/digestion';
import { DIGESTION_DIAGRAMS } from './digestion/diagrams';
import { legendItem as item, PhasedFigure } from './PhasedFigure';

const FIGURE_LABELS: Record<DigestionDiagramId, string> = {
  digerente: 'Schema del canale digerente',
  bocca: 'Schema della bocca',
  deglutizione: 'Schema della deglutizione',
  stomaco: 'Schema dello stomaco',
  duodeno: 'Schema del duodeno con fegato, colecisti e pancreas',
  villo: "Schema di un villo dell'intestino tenue",
  colon: "Schema dell'intestino crasso",
  retto: 'Schema del retto e del canale anale',
};

const LEGENDS: Partial<Record<DigestionDiagramId, ReactNode>> = {
  digerente: [item('food', 'Il bolo'), item('organ-active', 'Organi al lavoro in questa fase')],
  bocca: [item('food', 'Cibo'), item('saliva', 'Saliva'), item('gland', 'Ghiandole salivari')],
  deglutizione: [item('food', 'Il bolo'), item('muscle', 'Muscoli e sfinteri'), item('air', "Via dell'aria")],
  stomaco: [item('food', 'Cibo'), item('acid', 'Acido'), item('chyme', 'Chimo'), item('muscle', 'Onde muscolari')],
  duodeno: [
    item('chyme', 'Chimo'),
    item('bile', 'Bile'),
    item('juice', 'Succo pancreatico'),
    item('hormone', 'Ormoni'),
  ],
  villo: [
    item('sugar', 'Zuccheri semplici'),
    item('amino', 'Amminoacidi'),
    item('fat', 'Grassi'),
    item('lymph', 'Vaso chilifero'),
  ],
  colon: [item('stool', 'Contenuto'), item('water', 'Acqua assorbita'), item('bacteria', 'Batteri')],
  retto: [item('stool', 'Feci'), item('smooth', 'Muscolo liscio'), item('muscle', 'Muscolo scheletrico')],
};

/** Avvertenza sotto ogni schema; su smartphone sta nel foglio del percorso, sotto il testo. */
export const DIGESTION_DISCLAIMERS: Record<DigestionDiagramId, string> = {
  digerente:
    "Schema semplificato, non in scala. Il lato destro del corpo è a sinistra dell'immagine. I tempi sono quelli indicati dalle fonti e variano con il pasto.",
  bocca:
    'Schema semplificato, non in scala, visto di lato con il viso a sinistra. Le tre ghiandole salivari maggiori sono pari: qui se ne vede una per tipo.',
  deglutizione:
    "Schema semplificato, non in scala, visto di lato: l'esofago, lungo circa 25 cm, è accorciato. I movimenti sono accentuati.",
  stomaco:
    "Schema semplificato, non in scala. Il lato destro del corpo è a sinistra dell'immagine. Le onde sono accelerate: nello stomaco ne parte una ogni 20 secondi circa.",
  duodeno:
    "Schema semplificato, non in scala; i dotti sono ingranditi. Gli ormoni sono indicati da frecce, ma viaggiano con il sangue. Il lato destro del corpo è a sinistra dell'immagine.",
  villo:
    'Schema semplificato, non in scala: un villo misura da mezzo millimetro a un millimetro. Le molecole sono disegnate enormemente ingrandite.',
  colon:
    "Schema semplificato, non in scala. Il lato destro del corpo è a sinistra dell'immagine. I tempi sono accelerati: il contenuto resta nel crasso dalle 12 alle 24 ore.",
  retto: 'Schema semplificato, non in scala, in sezione.',
};

/** Schema animato di un passo del "Viaggio del cibo". */
export function DigestionFigure({ schema }: { schema: DigestionDiagramId }) {
  return (
    <PhasedFigure
      label={FIGURE_LABELS[schema]}
      className="digestion"
      phases={DIGESTION_PHASES[schema]}
      diagram={DIGESTION_DIAGRAMS[schema]}
      legend={LEGENDS[schema]}
      disclaimer={DIGESTION_DISCLAIMERS[schema]}
    />
  );
}
