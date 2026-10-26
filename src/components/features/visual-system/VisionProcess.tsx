import { StepPlayer } from '@/components/common/StepPlayer';
import type { VisionProcess as Process } from '@/models/content';
import { VisionDiagram } from './VisionDiagram';

/** Schema animato della vista, nelle schede degli occhi e del nervo ottico. */
export default function VisionProcess({ process, current }: { process: Process; current: string }) {
  return (
    <StepPlayer
      title={process.titolo}
      steps={process.passi}
      stepsLabel="Passi del processo"
      diagram={(step) => <VisionDiagram phase={step.fase} current={current} />}
      legend={
        <>
          <li className="legend-item">
            <span className="swatch organ-active" aria-hidden="true" /> Parti al lavoro in questo passo
          </li>
          <li className="legend-item">
            <span className="swatch organ-current" aria-hidden="true" /> Organo di questa scheda
          </li>
          <li className="legend-item">
            <span className="swatch light" aria-hidden="true" /> Luce
          </li>
          <li className="legend-item">
            <span className="swatch field-left" aria-hidden="true" /> Metà sinistra del campo visivo
          </li>
          <li className="legend-item">
            <span className="swatch field-right" aria-hidden="true" /> Metà destra del campo visivo
          </li>
        </>
      }
      disclaimer="Schema semplificato: forme, distanze e tempi non sono in scala. I raggi di luce sono solo alcuni fra i tanti, e il corpo vitreo, che riempie l'occhio, è solo accennato."
    />
  );
}
