import { useAtlas } from '@/hooks/useAtlas';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { BodyKind, Layer } from '@/models/atlas';
import { resetView } from '@/utils/sceneApi';

const LAYERS: Array<{ id: Layer; name: string; short: string }> = [
  { id: 'scheletro', name: 'Scheletro', short: 'Ossa' },
  { id: 'organi', name: 'Organi', short: 'Organi' },
  { id: 'muscoli', name: 'Muscoli', short: 'Muscoli' },
];

// Su schermo stretto i simboli (con il selettore di variante testuale, per non diventare emoji).
const BODIES: Array<{ id: BodyKind; name: string; short: string }> = [
  { id: 'uomo', name: 'Uomo', short: '\u2642\uFE0E' },
  { id: 'donna', name: 'Donna', short: '\u2640\uFE0E' },
];

/** Barra dei comandi della vista: corpo, strato, sagoma, vista iniziale e guida. */
export function Toolbar() {
  const { state, dispatch } = useAtlas();
  const reducedMotion = useReducedMotion();
  // La pelle del modello è maschile (D29): nel corpo femminile la sagoma non c'è.
  const skinAvailable = state.body === 'uomo';
  return (
    <div className="toolbar" role="toolbar" aria-label="Comandi della vista">
      <div className="layer-group" role="radiogroup" aria-label="Corpo">
        {BODIES.map((b) => (
          // biome-ignore lint/a11y/useSemanticElements: come gli strati, pulsanti con ruolo radio per lo stile a segmenti
          <button
            type="button"
            key={b.id}
            role="radio"
            aria-checked={state.body === b.id}
            className="layer"
            aria-label={b.name}
            onClick={() => dispatch({ type: 'setBody', body: b.id })}
          >
            <span className="full">{b.name}</span>
            <span className="short body-symbol" aria-hidden="true">
              {b.short}
            </span>
          </button>
        ))}
      </div>
      <span className="separator" aria-hidden="true" />
      <div className="layer-group" role="radiogroup" aria-label="Strato visibile">
        {LAYERS.map((l) => (
          // biome-ignore lint/a11y/useSemanticElements: pulsanti con ruolo radio per lo stile a segmenti; tastiera e lettori di schermo restano corretti
          <button
            type="button"
            key={l.id}
            role="radio"
            aria-checked={state.layer === l.id}
            className="layer"
            aria-label={l.name}
            onClick={() => dispatch({ type: 'setLayer', layer: l.id })}
          >
            <span className="full">{l.name}</span>
            <span className="short" aria-hidden="true">
              {l.short}
            </span>
          </button>
        ))}
      </div>
      <span className="separator" aria-hidden="true" />
      <button
        type="button"
        className="command"
        aria-pressed={state.skin && skinAvailable}
        disabled={!skinAvailable}
        title={skinAvailable ? undefined : 'La sagoma del modello è maschile: nel corpo femminile non è disponibile'}
        onClick={() => dispatch({ type: 'toggleSkin' })}
      >
        Sagoma
      </button>
      <button
        type="button"
        className="command"
        onClick={() => {
          dispatch({ type: 'select', id: null });
          resetView(!reducedMotion);
        }}
      >
        <span className="full">Vista iniziale</span>
        <span className="short" aria-hidden="true">
          Inizio
        </span>
      </button>
      <button
        type="button"
        className="command command-help"
        aria-keyshortcuts="?"
        aria-label="Aiuto"
        onClick={() => dispatch({ type: 'setTour', step: 0 })}
      >
        <span className="full">Aiuto</span>
        <span className="short" aria-hidden="true">
          ?
        </span>
      </button>
    </div>
  );
}
