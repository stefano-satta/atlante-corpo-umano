import type { ReactNode } from 'react';
import { NextIcon, PauseIcon, PlayIcon, PreviousIcon } from '@/components/common/Icons';
import { RichText } from '@/components/features/glossary/RichText';
import { usePlayback } from '@/hooks/usePlayback';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Step {
  titolo: string;
  html: string;
}

/**
 * Riquadro comune dei processi animati: titolo, disegno, comandi di riproduzione, didascalia
 * del passo con le fonti, legenda e avvertenza. Il disegno lo fornisce chi lo usa.
 */
export function StepPlayer<S extends Step>({
  title,
  steps,
  stepsLabel,
  diagram,
  legend,
  disclaimer,
}: {
  title: string;
  steps: S[];
  stepsLabel: string;
  diagram: (step: S, n: number, playing: boolean) => ReactNode;
  legend: ReactNode;
  disclaimer: ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const { step: n, playing, goTo, next, previous, toggle } = usePlayback(steps.length);
  const step = steps[n];

  return (
    <figure className="cycle" aria-label={title}>
      <figcaption className="cycle-title">{title}</figcaption>
      <div className="cycle-diagram" data-playing={playing}>
        {diagram(step, n, playing)}
      </div>

      <div className="cycle-controls">
        <button type="button" className="cycle-button" onClick={previous} aria-label="Passo precedente">
          <PreviousIcon />
        </button>
        {/* Con il movimento ridotto non c'è riproduzione continua: si va avanti un passo alla volta. */}
        {!reducedMotion && (
          <button type="button" className="cycle-button play" onClick={toggle} aria-pressed={playing}>
            {playing ? <PauseIcon /> : <PlayIcon />}
            {playing ? 'Pausa' : 'Riproduci'}
          </button>
        )}
        <button type="button" className="cycle-button" onClick={next} aria-label="Passo successivo">
          <NextIcon />
        </button>
        <ol className="cycle-steps" aria-label={stepsLabel}>
          {steps.map((p, i) => (
            <li key={p.titolo}>
              <button
                type="button"
                aria-label={`Passo ${i + 1}: ${p.titolo}`}
                aria-current={i === n ? 'step' : undefined}
                onClick={() => goTo(i)}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Durante la riproduzione le didascalie non vengono lette di continuo: solo quando si sceglie un passo. */}
      <div className="cycle-caption" aria-live={playing ? 'off' : 'polite'}>
        <p className="cycle-count label">
          Passo {n + 1} di {steps.length}
        </p>
        <h3>{step.titolo}</h3>
        <RichText className="text" html={step.html} />
      </div>

      <ul className="cycle-legend">{legend}</ul>
      <p className="cycle-disclaimer">{disclaimer}</p>
    </figure>
  );
}
