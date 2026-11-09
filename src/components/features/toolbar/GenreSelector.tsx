import { useAtlas } from '@/hooks/useAtlas';
import type { BodyKind } from '@/models/atlas';
import { SelectorGroup, type SelectorOption } from './SelectorGroup';

const BODIES: Array<SelectorOption<BodyKind>> = [
  { id: 'uomo', name: 'Uomo' },
  { id: 'donna', name: 'Donna' },
];

/** Selettore del genere Uomo/Donna (D29), che decide quale corpo si vede. */
export function GenreSelector() {
  const { state, dispatch } = useAtlas();
  return (
    <SelectorGroup
      title="Genere"
      variant="segments"
      options={BODIES}
      value={state.body}
      onChange={(body) => dispatch({ type: 'setBody', body })}
    />
  );
}
