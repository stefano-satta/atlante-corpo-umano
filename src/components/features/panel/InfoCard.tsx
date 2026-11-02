import { DraftNotice } from '@/components/common/DraftNotice';
import { BackIcon, CloseIcon, ForwardIcon, PauseIcon, PlayIcon } from '@/components/common/Icons';
import { LatinTerm } from '@/components/common/LatinTerm';
import { SourceList } from '@/components/common/SourceList';
import { RichText } from '@/components/features/glossary/RichText';
import { useAtlas } from '@/hooks/useAtlas';
import { useStructure } from '@/hooks/useContent';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { SceneUnit } from '@/models/scene';
import { registerCalloutTarget } from '@/utils/calloutPath';
import { contentForUnit, GUIDED_PATHS, hasGuidedPath } from '@/utils/content';
import { ORGANS_BY_ID } from '@/utils/organs';
import { membershipLabel } from '@/utils/structures';
import { Relations } from './Relations';

/** Ritorno al passo del percorso guidato da cui si è partiti per esplorare una struttura (D24). */
function BackToGuidedPath() {
  const { state, dispatch } = useAtlas();
  const path = state.guidedPath;
  if (!path || !hasGuidedPath(path.id)) return null;
  const title = GUIDED_PATHS.find((p) => p.id === path.id)?.titolo;
  return (
    <button type="button" className="back back-to-path" onClick={() => dispatch({ type: 'select', id: null })}>
      <BackIcon /> Torna al percorso “{title}”, passo {path.step + 1}
    </button>
  );
}

/**
 * Comando del battito del cuore 3D (D41). Il movimento parte da solo e dura più di 5 secondi,
 * quindi si deve poter fermare (WCAG 2.2.2). Con il movimento ridotto il cuore è fermo e il comando non serve.
 */
function HeartbeatToggle() {
  const { state, dispatch } = useAtlas();
  if (useReducedMotion()) return null;
  return (
    <div className="heartbeat">
      <button
        type="button"
        className="back heartbeat-toggle"
        aria-pressed={!state.heartbeat}
        onClick={() => dispatch({ type: 'toggleHeartbeat' })}
      >
        {state.heartbeat ? <PauseIcon /> : <PlayIcon />}
        {state.heartbeat ? 'Ferma il battito' : 'Riprendi il battito'}
      </button>
      <p className="heartbeat-note">Battito semplificato: ritmo e ampiezza non sono in scala.</p>
    </div>
  );
}

/** Cartellino della struttura selezionata: nome, termine, breve testo e fonti. */
export function InfoCard({ unit }: { unit: SceneUnit }) {
  const { dispatch } = useAtlas();
  const entry = contentForUnit(unit);
  const { data: structure, error } = useStructure(entry?.id);
  const organ = ORGANS_BY_ID.get(unit.id);
  const name = entry?.nome ?? organ?.name ?? unit.fmaName;
  const group = entry?.nomeApparato ?? membershipLabel(unit);

  const summary = structure?.sezioni[0];
  const relationSources = new Set(structure?.relazioni.map((r) => r.fonte));
  const sources = structure?.fonti.filter((f) => f.n <= structure.fontiBreve || relationSources.has(f.n)) ?? [];

  return (
    <div className="info-card">
      <BackToGuidedPath />
      <div className="panel-header">
        <span className="label">{group}</span>
        <button
          type="button"
          className="close"
          aria-label="Chiudi il cartellino"
          onClick={() => dispatch({ type: 'select', id: null })}
        >
          <CloseIcon />
        </button>
      </div>
      <h2 className={name.length > 16 ? 'name long' : 'name'} ref={registerCalloutTarget}>
        {name}
      </h2>
      {entry ? (
        <LatinTerm term={entry.termine} ta2={entry.ta2} />
      ) : organ ? (
        <p className="latin-term" lang="la">
          {organ.latinTerm}
        </p>
      ) : (
        <p className="provisional">
          Nome provvisorio in inglese,{' '}
          {unit.id.startsWith('ZA-') ? 'da Z-Anatomy' : 'dalla Foundational Model of Anatomy'}. Il nome italiano
          verificato è in preparazione.
        </p>
      )}
      {entry && <DraftNotice status={entry.stato} />}
      {unit.id === 'cuore' && <HeartbeatToggle />}

      {structure && summary ? (
        <>
          <RichText className="text" html={summary.html} />
          <Relations structure={structure} />
        </>
      ) : entry && !error ? (
        <p className="text pending" role="status">
          Caricamento del testo…
        </p>
      ) : (
        <>
          <p className="text pending">
            <span className="label">Testo in preparazione</span>
            Per questa struttura non c'è ancora una descrizione verificata.
          </p>
          <dl className="relations">
            <dt className="label">Fa parte di</dt>
            <dd>{group}</dd>
          </dl>
        </>
      )}

      {entry?.scheda && (
        <button type="button" className="action" onClick={() => dispatch({ type: 'setSheet', open: true })}>
          Apri la scheda <ForwardIcon />
        </button>
      )}

      {structure?.limiti && (
        <details className="source-notes">
          <summary>Note sulle fonti</summary>
          <p>{structure.limiti}</p>
        </details>
      )}
      {sources.length > 0 && (
        <section className="card-sources" aria-labelledby="card-sources-title">
          <h3 id="card-sources-title" className="label">
            Fonti
          </h3>
          <SourceList sources={sources} />
        </section>
      )}
      {!entry && unit.fma && unit.layer !== 'organi' && (
        <p className="fma-id">Identificativo FMA {unit.fma.replace(/^FMA/, '')}</p>
      )}
    </div>
  );
}
