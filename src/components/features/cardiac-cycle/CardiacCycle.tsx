import { StepPlayer } from '@/components/common/StepPlayer';
import type { HeartProcess } from '@/models/content';
import { HeartDiagram } from './HeartDiagram';

const HEART_SOUNDS = { primo: 'Primo tono', secondo: 'Secondo tono' } as const;

/**
 * Animazione del ciclo cardiaco nella scheda del cuore (M5). Ogni passo mostra lo schema
 * nello stato descritto dal contenuto e la didascalia con i rimandi alle fonti della scheda.
 */
export default function CardiacCycle({ process }: { process: HeartProcess }) {
  return (
    <StepPlayer
      title={process.titolo}
      steps={process.passi}
      stepsLabel="Passi del ciclo"
      diagram={(step, n) => (
        <>
          <HeartDiagram step={step} />
          {step.tono !== 'nessuno' && (
            <span className="cycle-badge" key={`${n}-${step.tono}`}>
              {HEART_SOUNDS[step.tono]}
            </span>
          )}
        </>
      )}
      legend={
        <>
          <li className="legend-item">
            <span className="swatch poor" aria-hidden="true" /> Sangue povero di ossigeno
          </li>
          <li className="legend-item">
            <span className="swatch rich" aria-hidden="true" /> Sangue ricco di ossigeno
          </li>
          <li className="legend-item">
            <span className="swatch signal" aria-hidden="true" /> Segnale elettrico
          </li>
        </>
      }
      disclaimer="Schema semplificato: forme, proporzioni e tempi non sono in scala. Il lato destro del cuore è a sinistra dell'immagine, come in una persona vista di fronte."
    />
  );
}
