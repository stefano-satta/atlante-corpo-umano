import { StepPlayer } from '@/components/common/StepPlayer';
import type { ThyroidProcess as Process } from '@/models/content';
import { ThyroidDiagram } from './ThyroidDiagram';

/** Schema animato della regolazione della tiroide, nelle schede di tiroide, ipofisi e ipotalamo. */
export default function ThyroidProcess({ process, current }: { process: Process; current: string }) {
  return (
    <StepPlayer
      title={process.titolo}
      steps={process.passi}
      stepsLabel="Passi del processo"
      diagram={(step) => <ThyroidDiagram phase={step.fase} current={current} />}
      legend={
        <>
          <li className="legend-item">
            <span className="swatch organ-active" aria-hidden="true" /> Organi al lavoro in questo passo
          </li>
          <li className="legend-item">
            <span className="swatch organ-current" aria-hidden="true" /> Organo di questa scheda
          </li>
          <li className="legend-item">
            <span className="swatch iodine" aria-hidden="true" /> Iodio
          </li>
        </>
      }
      disclaimer="Schema semplificato: forme, distanze e tempi non sono in scala. Gli organi del corpo sono simbolici: gli ormoni tiroidei agiscono su quasi tutti."
    />
  );
}
