import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/common/Button';
import { DraftNotice } from '@/components/common/DraftNotice';
import { BackIcon, CloseIcon, ForwardIcon, PauseIcon, PlayIcon } from '@/components/common/Icons';
import { SourceDisclosure } from '@/components/common/SourceDisclosure';
import { RichText } from '@/components/features/glossary/RichText';
import { useActiveStep } from '@/hooks/useActiveStep';
import { useAtlas } from '@/hooks/useAtlas';
import { useBreathPhase } from '@/hooks/useBreathPhase';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useCoverScene } from '@/hooks/useSceneCovered';
import { useTextOnly } from '@/hooks/useTextOnly';
import { isCirculationDiagram } from '@/models/circulation';
import type { GuidedPathStep } from '@/models/content';
import { isDigestionDiagram } from '@/models/digestion';
import { isVisionPathDiagram } from '@/models/visionPath';
import { NARROW_WIDTH } from '@/utils/layout';
import { AlveolusDiagram, ChestDiagram } from './BreathingDiagrams';
import { CIRCULATION_DISCLAIMERS, CirculationFigure } from './CirculationFigure';
import { DIGESTION_DISCLAIMERS, DigestionFigure } from './DigestionFigure';
import { VISION_PATH_DISCLAIMER, VisionPathFigure } from './VisionPathFigure';

const PHASE_LABELS = { rest: null, inhale: 'Inspirazione', exhale: 'Espirazione' } as const;

/** Schema 2D del passo, con la riproduzione continua (assente con il movimento ridotto). */
function StepDiagram({ step }: { step: GuidedPathStep }) {
  const reducedMotion = useReducedMotion();
  // La riproduzione parte ferma (WCAG 2.2.2) e si ferma cambiando passo: il componente si rimonta.
  const [playing, setPlaying] = useState(false);
  const phase = useBreathPhase(step.schema, playing && !reducedMotion, reducedMotion);
  const alveolus = step.schema === 'alveolo';

  return (
    <figure className="cycle breathing" aria-label={alveolus ? 'Schema di un alveolo' : 'Schema del torace'}>
      <div className="cycle-diagram" data-playing={playing}>
        {alveolus ? <AlveolusDiagram /> : <ChestDiagram phase={phase} />}
        {!alveolus && PHASE_LABELS[phase] && (
          <span className="cycle-badge phase-badge" key={phase}>
            {PHASE_LABELS[phase]}
          </span>
        )}
      </div>
      {!reducedMotion && (
        <div className="cycle-controls">
          <Button variant="cycle" className="play" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
            {playing ? <PauseIcon /> : <PlayIcon />}
            <span className="play-text">
              {playing ? 'Pausa' : alveolus ? 'Riproduci gli scambi' : 'Riproduci il respiro'}
            </span>
          </Button>
        </div>
      )}
      {alveolus && (
        <ul className="cycle-legend">
          <li className="legend-item">
            <span className="swatch poor" aria-hidden="true" /> Sangue povero di ossigeno
          </li>
          <li className="legend-item">
            <span className="swatch rich" aria-hidden="true" /> Sangue ricco di ossigeno
          </li>
          <li className="legend-item">
            <span className="swatch oxygen" aria-hidden="true" /> Ossigeno, dall'aria al sangue
          </li>
          <li className="legend-item">
            <span className="swatch co2" aria-hidden="true" /> Anidride carbonica, dal sangue all'aria
          </li>
        </ul>
      )}
      <p className="cycle-disclaimer">{disclaimerFor(step.schema)}</p>
    </figure>
  );
}

/** Avvertenza dello schema del passo: sotto il disegno, e su smartphone nel foglio, sotto il testo. */
function disclaimerFor(schema: string) {
  if (isDigestionDiagram(schema)) return DIGESTION_DISCLAIMERS[schema];
  if (isCirculationDiagram(schema)) return CIRCULATION_DISCLAIMERS[schema];
  if (isVisionPathDiagram(schema)) return VISION_PATH_DISCLAIMER;
  return schema === 'alveolo'
    ? 'Schema semplificato, non in scala: un solo alveolo e un solo capillare.'
    : "Schema semplificato, non in scala; i movimenti sono accentuati. Il lato destro del corpo è a sinistra dell'immagine.";
}

/**
 * Percorso guidato nel pannello a destra (D24): un passo alla volta, con testo, schema e fonti.
 * Ogni passo sceglie lo strato e le strutture evidenziate; la telecamera le inquadra (Scene.tsx).
 *
 * Su smartphone il pannello si divide in due: in alto il "palco", con lo schema del passo a tutta
 * larghezza al posto del corpo 3D (un interruttore riporta il corpo), e sotto il foglio con testo e
 * comandi, che una maniglia apre a tutta altezza. Mentre lo schema copre il corpo la scena si ferma.
 */
export default function GuidedPathPanel() {
  const { dispatch } = useAtlas();
  const textOnly = useTextOnly();
  const { path, step, number, error } = useActiveStep();
  const title = useRef<HTMLHeadingElement>(null);
  const total = path?.passi.length ?? 0;
  const narrow = useMediaQuery(`(max-width: ${NARROW_WIDTH}px)`) && !textOnly;
  // Scelte di chi legge su smartphone, tenute per tutto il percorso: cosa mostra il palco, foglio aperto.
  const [stage, setStage] = useState<'schema' | 'body'>('schema');
  const [expanded, setExpanded] = useState(false);
  const hasFigure = !!step && step.schema !== 'nessuno';
  useCoverScene(narrow && (expanded || (hasFigure && stage === 'schema')));

  // Ogni passo mostra il suo strato: anche tornando al percorso dopo aver esplorato.
  useEffect(() => {
    if (step) dispatch({ type: 'revealLayer', layer: step.strato });
  }, [step, dispatch]);

  // Un indirizzo con un passo oltre l'ultimo porta all'ultimo.
  useEffect(() => {
    if (path && number >= total) dispatch({ type: 'setGuidedPath', guidedPath: { id: path.id, step: total - 1 } });
  }, [path, number, total, dispatch]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a ogni nuovo passo il pannello torna in cima
  useEffect(() => {
    const article = title.current?.closest('.guided-path');
    for (const container of [article, article?.closest('.panel, .reading-page')])
      if (container) container.scrollTop = 0;
  }, [number]);

  if (error) return <p className="notice guided-path">Non è stato possibile caricare il percorso.</p>;
  if (!path || !step)
    return (
      <p className="guided-path text pending" role="status">
        Caricamento del percorso…
      </p>
    );

  const goTo = (n: number) => dispatch({ type: 'setGuidedPath', guidedPath: { id: path.id, step: n } });
  const close = () => dispatch({ type: 'setGuidedPath', guidedPath: null });
  const last = number === total - 1;
  // Fonti citate in questo passo, con la numerazione del percorso.
  const cited = new Set([...step.html.matchAll(/#fonte-(\d+)/g)].map((m) => Number(m[1])));
  const sources = path.fonti.filter((f) => cited.has(f.n));

  return (
    <article
      className="guided-path"
      aria-labelledby="path-step-title"
      data-stage={hasFigure ? stage : 'body'}
      data-expanded={expanded || undefined}
    >
      {narrow && (
        <Button className="sheet-handle" aria-expanded={expanded} onClick={() => setExpanded((e) => !e)}>
          <span className="visually-hidden">Testo a tutta altezza</span>
        </Button>
      )}
      <div className="panel-header">
        <span className="label">Percorso · {path.titolo}</span>
        <Button variant="close" aria-label="Chiudi il percorso" onClick={close}>
          <CloseIcon />
        </Button>
      </div>
      <p className="path-count label">
        Passo {number + 1} di {total}
      </p>
      <h2 id="path-step-title" ref={title} className={step.titolo.length > 16 ? 'name long' : 'name'}>
        {step.titolo}
      </h2>
      <p className="visually-hidden" aria-live="polite">
        Passo {number + 1} di {total}: {step.titolo}
      </p>
      <DraftNotice status={path.stato} />

      {narrow && hasFigure && !expanded && (
        <fieldset className="stage-switch">
          <legend className="visually-hidden">Mostra in alto</legend>
          <Button aria-pressed={stage === 'schema'} onClick={() => setStage('schema')}>
            Schema
          </Button>
          <Button aria-pressed={stage === 'body'} onClick={() => setStage('body')}>
            Corpo 3D
          </Button>
        </fieldset>
      )}
      {isDigestionDiagram(step.schema) ? (
        <DigestionFigure key={number} schema={step.schema} />
      ) : isCirculationDiagram(step.schema) ? (
        <CirculationFigure key={number} schema={step.schema} />
      ) : isVisionPathDiagram(step.schema) ? (
        <VisionPathFigure key={number} schema={step.schema} />
      ) : (
        step.schema !== 'nessuno' && <StepDiagram key={number} step={step} />
      )}
      <RichText className="text" html={step.html} />
      {narrow && hasFigure && <p className="path-disclaimer">{disclaimerFor(step.schema)}</p>}

      <nav className="path-controls" aria-label="Passi del percorso">
        <Button variant="back" onClick={() => goTo(number - 1)} disabled={number === 0}>
          <BackIcon /> <span className="path-back-text">Indietro</span>
        </Button>
        {last ? (
          <Button variant="action" onClick={close}>
            {textOnly ? (
              "Torna all'indice"
            ) : (
              <span>
                Esplora<span className="path-finish-extra"> liberamente</span>
              </span>
            )}{' '}
            <ForwardIcon />
          </Button>
        ) : (
          <Button variant="action" onClick={() => goTo(number + 1)}>
            Avanti <ForwardIcon />
          </Button>
        )}
        <ol className="path-steps">
          {path.passi.map((p, i) => (
            <li key={p.titolo}>
              <Button
                aria-label={`Passo ${i + 1}: ${p.titolo}`}
                aria-current={i === number ? 'step' : undefined}
                data-done={i < number || undefined}
                onClick={() => goTo(i)}
              >
                {i + 1}
              </Button>
            </li>
          ))}
        </ol>
      </nav>
      {textOnly ? (
        <p className="note">Nella versione testuale il corpo 3D non c'è: restano il testo e gli schemi.</p>
      ) : (
        <p className="note">
          Puoi ruotare il corpo e scegliere una struttura in ogni momento, poi tornare al percorso.
        </p>
      )}

      {(path.limiti || sources.length > 0) && (
        <div className="card-sources">
          {path.limiti && (
            <details className="source-notes">
              <summary>Note sulle fonti</summary>
              <p>{path.limiti}</p>
            </details>
          )}
          {sources.length > 0 && <SourceDisclosure title="Fonti di questo passo" sources={sources} />}
        </div>
      )}
    </article>
  );
}
