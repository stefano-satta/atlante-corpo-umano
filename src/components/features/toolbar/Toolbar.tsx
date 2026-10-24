import { useAtlas } from '@/hooks/useAtlas';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { Layer } from '@/models/atlas';
import { resetView } from '@/utils/sceneApi';

const LAYERS: Array<{ id: Layer; name: string; short: string }> = [
  { id: 'muscoli', name: 'Muscoli', short: 'Muscoli' },
  { id: 'organi', name: 'Scheletro e organi', short: 'Organi' },
  { id: 'scheletro', name: 'Scheletro', short: 'Scheletro' },
];

/** Barra dei comandi della vista: strato, sagoma, vista iniziale e guida. */
export function Toolbar() {
  const { state, dispatch } = useAtlas();
  const reducedMotion = useReducedMotion();
  return (
    <div className="toolbar" role="toolbar" aria-label="Comandi della vista">
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
        aria-pressed={state.skin}
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
