import { useEffect, useRef, useState } from 'react';
import { DraftNotice } from '@/components/common/DraftNotice';
import { BackIcon, CloseIcon, ForwardIcon, PauseIcon, PlayIcon } from '@/components/common/Icons';
import { SourceList } from '@/components/common/SourceList';
import { RichText } from '@/components/features/glossary/RichText';
import { useActiveStep } from '@/hooks/useActiveStep';
import { useAtlas } from '@/hooks/useAtlas';
import { useBreathPhase } from '@/hooks/useBreathPhase';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTextOnly } from '@/hooks/useTextOnly';
import type { GuidedPathStep } from '@/models/content';
import { AlveolusDiagram, ChestDiagram } from './BreathingDiagrams';

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
          <button
            type="button"
            className="cycle-button play"
            onClick={() => setPlaying((p) => !p)}
            aria-pressed={playing}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
            {playing ? 'Pausa' : alveolus ? 'Riproduci gli scambi' : 'Riproduci il respiro'}
          </button>
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
      <p className="cycle-disclaimer">
        {alveolus
          ? 'Schema semplificato, non in scala: un solo alveolo e un solo capillare.'
          : "Schema semplificato, non in scala; i movimenti sono accentuati. Il lato destro del corpo è a sinistra dell'immagine."}
      </p>
    </figure>
  );
}

/**
 * Percorso guidato nel pannello a destra (D24): un passo alla volta, con testo, schema e fonti.
 * Ogni passo sceglie lo strato e le strutture evidenziate; la telecamera le inquadra (Scene.tsx).
 */
export default function GuidedPathPanel() {
  const { dispatch } = useAtlas();
  const textOnly = useTextOnly();
  const { path, step, number, error } = useActiveStep();
  const title = useRef<HTMLHeadingElement>(null);
  const total = path?.passi.length ?? 0;

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
    const container = title.current?.closest('.panel, .reading-page');
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
    <article className="guided-path" aria-labelledby="path-step-title">
      <div className="panel-header">
        <span className="label">Percorso · {path.titolo}</span>
        <button type="button" className="close" aria-label="Chiudi il percorso" onClick={close}>
          <CloseIcon />
        </button>
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

      {step.schema !== 'nessuno' && <StepDiagram key={number} step={step} />}
      <RichText className="text" html={step.html} />

      <nav className="path-controls" aria-label="Passi del percorso">
        <button type="button" className="back" onClick={() => goTo(number - 1)} disabled={number === 0}>
          <BackIcon /> Indietro
        </button>
        {last ? (
          <button type="button" className="action" onClick={close}>
            {textOnly ? "Torna all'indice" : 'Esplora liberamente'} <ForwardIcon />
          </button>
        ) : (
          <button type="button" className="action" onClick={() => goTo(number + 1)}>
            Avanti <ForwardIcon />
          </button>
        )}
        <ol className="path-steps">
          {path.passi.map((p, i) => (
            <li key={p.titolo}>
              <button
                type="button"
                aria-label={`Passo ${i + 1}: ${p.titolo}`}
                aria-current={i === number ? 'step' : undefined}
                onClick={() => goTo(i)}
              >
                {i + 1}
              </button>
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

      {path.limiti && (
        <details className="source-notes">
          <summary>Note sulle fonti</summary>
          <p>{path.limiti}</p>
        </details>
      )}
      {sources.length > 0 && (
        <section className="card-sources" aria-labelledby="path-sources-title">
          <h3 id="path-sources-title" className="label">
            Fonti di questo passo
          </h3>
          <SourceList sources={sources} />
        </section>
      )}
    </article>
  );
}
