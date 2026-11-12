import type { ReactNode } from 'react';
import { Button } from '@/components/common/Button';
import { NextIcon, PauseIcon, PlayIcon, PreviousIcon } from '@/components/common/Icons';
import { usePlayback } from '@/hooks/usePlayback';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { DiagramPhase } from '@/models/phases';

/** Disegno di uno schema a fasi: riceve la fase e, in riproduzione, accende i movimenti continui. */
export interface PhasedDiagramProps {
  phase: string;
  playing: boolean;
  reducedMotion: boolean;
}

interface PhasedFigureProps {
  /** Nome accessibile della figura. */
  label: string;
  /** Classe dell'insieme di schemi (`digestion`, `circulation`), che porta i colori del disegno. */
  className: string;
  phases: DiagramPhase[];
  diagram: (props: PhasedDiagramProps) => React.JSX.Element;
  legend?: ReactNode;
  disclaimer: string;
}

/** Voce della legenda sotto lo schema. */
export const legendItem = (swatch: string, text: string) => (
  <li className="legend-item" key={swatch}>
    <span className={`swatch ${swatch}`} aria-hidden="true" /> {text}
  </li>
);

/**
 * Schema animato a fasi di un passo di percorso: il disegno, i comandi per scorrerne le fasi o
 * riprodurle di seguito e una didascalia breve. Parte fermo (WCAG 2.2.2) e con il movimento ridotto
 * non ha Riproduci: le fasi si scelgono una alla volta. Con una fase sola restano disegno e didascalia.
 */
export function PhasedFigure({ label, className, phases, diagram: Diagram, legend, disclaimer }: PhasedFigureProps) {
  const reducedMotion = useReducedMotion();
  const { step: n, playing, goTo, next, previous, toggle } = usePlayback(phases.length);
  const phase = phases[n];
  // Uno schema con una sola fase non ha nulla da scorrere: niente comandi né conteggio.
  const single = phases.length === 1;

  return (
    <figure className={`cycle phased ${className}`} aria-label={label}>
      <div className="cycle-diagram" data-playing={playing}>
        <Diagram phase={phase.id} playing={playing && !reducedMotion} reducedMotion={reducedMotion} />
      </div>

      <div className="phase-caption" aria-live={playing ? 'off' : 'polite'}>
        {single || (
          <span className="label">
            Fase {n + 1} di {phases.length}
          </span>
        )}
        <p>
          <strong>{phase.label}</strong>
          {phase.detail && <> · {phase.detail}</>}
        </p>
      </div>

      {single || (
        <div className="cycle-controls">
          <Button variant="cycle" onClick={previous} aria-label="Fase precedente">
            <PreviousIcon />
          </Button>
          {!reducedMotion && (
            <Button variant="cycle" className="play" onClick={toggle} aria-pressed={playing}>
              {playing ? <PauseIcon /> : <PlayIcon />}
              <span className="play-text">{playing ? 'Pausa' : 'Riproduci'}</span>
            </Button>
          )}
          <Button variant="cycle" onClick={next} aria-label="Fase successiva">
            <NextIcon />
          </Button>
          <ol className="cycle-steps" aria-label="Fasi dello schema">
            {phases.map((p, i) => (
              <li key={p.id}>
                <Button
                  aria-label={`Fase ${i + 1}: ${p.label}`}
                  aria-current={i === n ? 'step' : undefined}
                  onClick={() => goTo(i)}
                >
                  {i + 1}
                </Button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {legend && <ul className="cycle-legend">{legend}</ul>}
      <p className="cycle-disclaimer">{disclaimer}</p>
    </figure>
  );
}
