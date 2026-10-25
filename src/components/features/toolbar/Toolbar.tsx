import { useAtlas } from '@/hooks/useAtlas';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { resetView } from '@/utils/sceneApi';

/** Barra dei comandi della vista: sagoma, vista iniziale e guida. Corpo e strato hanno i loro selettori (BodySwitch, LayerSwitch). */
export function Toolbar() {
  const { state, dispatch } = useAtlas();
  const reducedMotion = useReducedMotion();
  // La pelle del modello è maschile (D29): nel corpo femminile la sagoma non c'è.
  const skinAvailable = state.body === 'uomo';
  return (
    <div className="toolbar" role="toolbar" aria-label="Comandi della vista">
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
