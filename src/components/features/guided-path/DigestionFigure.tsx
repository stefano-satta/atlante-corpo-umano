import type { ReactNode } from 'react';
import { NextIcon, PauseIcon, PlayIcon, PreviousIcon } from '@/components/common/Icons';
import { usePlayback } from '@/hooks/usePlayback';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { DIGESTION_PHASES, type DigestionDiagramId } from '@/models/digestion';
import { DIGESTION_DIAGRAMS } from './DigestionDiagrams';

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

const item = (swatch: string, text: string) => (
  <li className="legend-item" key={swatch}>
    <span className={`swatch ${swatch}`} aria-hidden="true" /> {text}
  </li>
);

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

const DISCLAIMERS: Record<DigestionDiagramId, string> = {
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

/**
 * Schema animato di un passo del "Viaggio del cibo": il disegno, i comandi per scorrerne le fasi o
 * riprodurle di seguito e una didascalia breve. Parte fermo (WCAG 2.2.2) e con il movimento ridotto
 * non ha Riproduci: le fasi si scelgono una alla volta.
 */
export function DigestionFigure({ schema }: { schema: DigestionDiagramId }) {
  const reducedMotion = useReducedMotion();
  const phases = DIGESTION_PHASES[schema];
  const { step: n, playing, goTo, next, previous, toggle } = usePlayback(phases.length);
  const phase = phases[n];
  const Diagram = DIGESTION_DIAGRAMS[schema];

  return (
    <figure className="cycle digestion" aria-label={FIGURE_LABELS[schema]}>
      <div className="cycle-diagram" data-playing={playing}>
        <Diagram phase={phase.id} playing={playing && !reducedMotion} reducedMotion={reducedMotion} />
      </div>

      <div className="digestion-caption" aria-live={playing ? 'off' : 'polite'}>
        <span className="label">
          Fase {n + 1} di {phases.length}
        </span>
        <p>
          <strong>{phase.label}</strong>
          {phase.detail && <> · {phase.detail}</>}
        </p>
      </div>

      <div className="cycle-controls">
        <button type="button" className="cycle-button" onClick={previous} aria-label="Fase precedente">
          <PreviousIcon />
        </button>
        {!reducedMotion && (
          <button type="button" className="cycle-button play" onClick={toggle} aria-pressed={playing}>
            {playing ? <PauseIcon /> : <PlayIcon />}
            {playing ? 'Pausa' : 'Riproduci'}
          </button>
        )}
        <button type="button" className="cycle-button" onClick={next} aria-label="Fase successiva">
          <NextIcon />
        </button>
        <ol className="cycle-steps" aria-label="Fasi dello schema">
          {phases.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                aria-label={`Fase ${i + 1}: ${p.label}`}
                aria-current={i === n ? 'step' : undefined}
                onClick={() => goTo(i)}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {LEGENDS[schema] && <ul className="cycle-legend">{LEGENDS[schema]}</ul>}
      <p className="cycle-disclaimer">{DISCLAIMERS[schema]}</p>
    </figure>
  );
}
