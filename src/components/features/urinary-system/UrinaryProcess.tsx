import { StepPlayer } from '@/components/common/StepPlayer';
import type { BodyKind } from '@/models/atlas';
import type { UrinaryProcess as Process } from '@/models/content';
import { UrinaryDiagram } from './UrinaryDiagram';

/**
 * Schema animato dell'apparato urinario, nella scheda di ognuno dei suoi organi, per il corpo
 * mostrato nell'atlante: l'uretra femminile, assente dal modello 3D, c'è solo nello schema.
 */
export default function UrinaryProcess({
  process,
  current,
  body,
}: {
  process: Process;
  current: string;
  body: BodyKind;
}) {
  return (
    <StepPlayer
      title={process.titolo}
      steps={process.passi}
      stepsLabel="Passi del processo"
      diagram={(step) => <UrinaryDiagram phase={step.fase} current={current} body={body} />}
      legend={
        <>
          <li className="legend-item">
            <span className="swatch organ-active" aria-hidden="true" /> Organi al lavoro in questo passo
          </li>
          <li className="legend-item">
            <span className="swatch organ-current" aria-hidden="true" /> Organo di questa scheda
          </li>
          <li className="legend-item">
            <span className="swatch urine" aria-hidden="true" /> Urina
          </li>
        </>
      }
      disclaimer="Schema semplificato, visto di fronte: forme, proporzioni e tempi non sono in scala. Il lato destro del corpo è a sinistra dell'immagine. Gli ureteri non sono nel modello 3D."
    />
  );
}
