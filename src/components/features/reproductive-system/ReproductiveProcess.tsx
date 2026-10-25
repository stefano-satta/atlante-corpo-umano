import { StepPlayer } from '@/components/common/StepPlayer';
import type { ReproductiveProcess as Process } from '@/models/content';
import { FemaleDiagram } from './FemaleDiagram';
import { MaleDiagram } from './MaleDiagram';

/**
 * Schema animato di tutto l'apparato genitale, nella scheda di ognuno dei suoi organi. Ogni
 * passo colora gli organi al lavoro; l'organo della scheda aperta ha il contorno chiaro.
 */
export default function ReproductiveProcess({ process, current }: { process: Process; current: string }) {
  const Diagram = process.schema === 'genitale-maschile' ? MaleDiagram : FemaleDiagram;
  const cell = process.schema === 'genitale-maschile' ? 'Spermatozoi' : 'Ovocita';
  return (
    <StepPlayer
      title={process.titolo}
      steps={process.passi}
      stepsLabel="Passi del processo"
      diagram={(step) => <Diagram phase={step.fase} current={current} />}
      legend={
        <>
          <li className="legend-item">
            <span className="swatch organ-active" aria-hidden="true" /> Organi al lavoro in questo passo
          </li>
          <li className="legend-item">
            <span className="swatch organ-current" aria-hidden="true" /> Organo di questa scheda
          </li>
          <li className="legend-item">
            <span className="swatch cell" aria-hidden="true" /> {cell}
          </li>
        </>
      }
      disclaimer="Schema semplificato, visto di fronte: forme, proporzioni e tempi non sono in scala. Il lato destro del corpo è a sinistra dell'immagine."
    />
  );
}
