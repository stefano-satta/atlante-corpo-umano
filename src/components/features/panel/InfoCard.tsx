import { Button } from '@/components/common/Button';
import { DraftNotice } from '@/components/common/DraftNotice';
import {
  BackIcon,
  CloseIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  SoundIcon,
  SoundOffIcon,
} from '@/components/common/Icons';
import { LatinTerm } from '@/components/common/LatinTerm';
import { PageLink } from '@/components/common/PageLink';
import { SourceDisclosure } from '@/components/common/SourceDisclosure';
import { RichText } from '@/components/features/glossary/RichText';
import { useAtlas } from '@/hooks/useAtlas';
import { useStructure } from '@/hooks/useContent';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { SceneUnit } from '@/models/scene';
import { registerCalloutTarget } from '@/utils/calloutPath';
import { contentForUnit, GUIDED_PATHS, hasGuidedPath } from '@/utils/content';
import { unlockHeartSound } from '@/utils/heartSound';
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
    <Button variant="back" className="back-to-path" onClick={() => dispatch({ type: 'select', id: null })}>
      <BackIcon /> Torna al percorso “{title}”, passo {path.step + 1}
    </Button>
  );
}

/**
 * Comandi del battito del cuore 3D (D41) e del suo suono (D42). Il movimento parte da solo e dura
 * più di 5 secondi, quindi si deve poter fermare (WCAG 2.2.2); il suono invece parte solo su richiesta.
 * Con il movimento ridotto il cuore è fermo e i comandi non servono.
 */
function HeartbeatToggle() {
  const { state, dispatch } = useAtlas();
  if (useReducedMotion()) return null;
  return (
    <div className="heartbeat">
      <Button
        variant="back"
        className="heartbeat-toggle"
        aria-pressed={!state.heartbeat}
        onClick={() => dispatch({ type: 'toggleHeartbeat' })}
      >
        {state.heartbeat ? <PauseIcon /> : <PlayIcon />}
        {state.heartbeat ? 'Ferma il battito' : 'Riprendi il battito'}
      </Button>
      {state.heartbeat && (
        <Button
          variant="back"
          className="heartbeat-toggle"
          aria-pressed={state.heartSound}
          onClick={() => {
            if (state.heartSound || unlockHeartSound()) dispatch({ type: 'toggleHeartSound' });
          }}
        >
          {state.heartSound ? <SoundOffIcon /> : <SoundIcon />}
          {state.heartSound ? 'Togli il suono' : 'Ascolta il battito'}
        </Button>
      )}
      <p className="heartbeat-note">
        Battito semplificato: ritmo e ampiezza non sono in scala; il suono è sintetizzato.
      </p>
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
        <Button
          variant="close"
          aria-label="Chiudi il cartellino"
          onClick={() => dispatch({ type: 'select', id: null })}
        >
          <CloseIcon />
        </Button>
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
          Nome provvisorio in inglese, {unit.fma ? 'dalla Foundational Model of Anatomy' : 'da Z-Anatomy'}. Il nome
          italiano verificato è in preparazione.
        </p>
      )}
      {entry && <DraftNotice status={entry.stato} />}
      {unit.id === 'cuore' && <HeartbeatToggle />}

      {structure && summary ? (
        <>
          <RichText className="text" html={summary.html} />
          {unit.layer === 'vasi' && (
            <p className="text">
              <PageLink page="circolazione">Come circola il sangue</PageLink>
            </p>
          )}
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
        <Button variant="action" onClick={() => dispatch({ type: 'setSheet', open: true })}>
          Apri la scheda <ForwardIcon />
        </Button>
      )}

      {(structure?.limiti || sources.length > 0) && (
        <div className="card-sources">
          {structure?.limiti && (
            <details className="source-notes">
              <summary>Note sulle fonti</summary>
              <p>{structure.limiti}</p>
            </details>
          )}
          {sources.length > 0 && <SourceDisclosure title="Fonti" sources={sources} />}
        </div>
      )}
      {!entry && unit.fma && unit.layer !== 'organi' && (
        <p className="fma-id">Identificativo FMA {unit.fma.replace(/^FMA/, '')}</p>
      )}
    </div>
  );
}
