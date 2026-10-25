import { useAtlas } from '@/hooks/useAtlas';
import type { Layer } from '@/models/atlas';

const LAYERS: Array<{ id: Layer; name: string; short: string }> = [
  { id: 'scheletro', name: 'Scheletro', short: 'Ossa' },
  { id: 'organi', name: 'Organi', short: 'Organi' },
  { id: 'muscoli', name: 'Muscoli', short: 'Muscoli' },
];

/** Selettore dello strato visibile, in un riquadro separato dalla barra dei comandi. */
export function LayerSwitch() {
  const { state, dispatch } = useAtlas();
  return (
    <div className="layer-switch" role="radiogroup" aria-label="Strato visibile">
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
  );
}
