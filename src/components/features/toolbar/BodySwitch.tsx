import { useAtlas } from '@/hooks/useAtlas';
import type { BodyKind } from '@/models/atlas';

// Su schermo stretto i simboli (con il selettore di variante testuale, per non diventare emoji).
const BODIES: Array<{ id: BodyKind; name: string; short: string }> = [
  { id: 'uomo', name: 'Uomo', short: '♂︎' },
  { id: 'donna', name: 'Donna', short: '♀︎' },
];

/** Selettore del corpo Uomo/Donna (D29), in un riquadro separato dalla barra dei comandi. */
export function BodySwitch() {
  const { state, dispatch } = useAtlas();
  return (
    <div className="body-switch" role="radiogroup" aria-label="Corpo">
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
  );
}
