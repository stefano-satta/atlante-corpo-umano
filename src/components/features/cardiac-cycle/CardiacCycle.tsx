import { NextIcon, PauseIcon, PlayIcon, PreviousIcon } from '@/components/common/Icons';
import { RichText } from '@/components/features/glossary/RichText';
import { usePlayback } from '@/hooks/usePlayback';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { Process } from '@/models/content';
import { HeartDiagram } from './HeartDiagram';

const HEART_SOUNDS = { primo: 'Primo tono', secondo: 'Secondo tono' } as const;

/**
 * Animazione del ciclo cardiaco nella scheda del cuore (M5). Ogni passo mostra lo schema
 * nello stato descritto dal contenuto e la didascalia con i rimandi alle fonti della scheda.
 */
export default function CardiacCycle({ process }: { process: Process }) {
  const reducedMotion = useReducedMotion();
  const { step: n, playing, goTo, next, previous, toggle } = usePlayback(process.passi.length);
  const step = process.passi[n];
  const total = process.passi.length;

  return (
    <figure className="cycle" aria-labelledby="cycle-title">
      <figcaption id="cycle-title" className="cycle-title">
        {process.titolo}
      </figcaption>
      <div className="cycle-diagram" data-playing={playing}>
        <HeartDiagram step={step} />
        {step.tono !== 'nessuno' && (
          <span className="cycle-badge" key={`${n}-${step.tono}`}>
            {HEART_SOUNDS[step.tono]}
          </span>
        )}
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
        <ol className="cycle-steps" aria-label="Passi del ciclo">
          {process.passi.map((p, i) => (
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
          Passo {n + 1} di {total}
        </p>
        <h3>{step.titolo}</h3>
        <RichText className="text" html={step.html} />
      </div>

      <ul className="cycle-legend">
        <li className="legend-item">
          <span className="swatch poor" aria-hidden="true" /> Sangue povero di ossigeno
        </li>
        <li className="legend-item">
          <span className="swatch rich" aria-hidden="true" /> Sangue ricco di ossigeno
        </li>
        <li className="legend-item">
          <span className="swatch signal" aria-hidden="true" /> Segnale elettrico
        </li>
      </ul>
      <p className="cycle-disclaimer">
        Schema semplificato: forme, proporzioni e tempi non sono in scala. Il lato destro del cuore è a sinistra
        dell'immagine, come in una persona vista di fronte.
      </p>
    </figure>
  );
}
