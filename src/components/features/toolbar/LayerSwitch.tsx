import { useAtlas } from '@/hooks/useAtlas';
import type { Layer } from '@/models/atlas';
import { SelectorGroup, type SelectorOption } from './SelectorGroup';

/** L'ordine è quello dei tasti da 1 a 9. */
const LAYERS: Array<SelectorOption<Layer>> = [
  { id: 'organi', name: 'Organi' },
  { id: 'scheletro', name: 'Scheletro' },
  { id: 'muscoli', name: 'Muscoli' },
  { id: 'vasi', name: 'Cardiocircolatorio' },
  { id: 'nervi', name: 'Nervoso' },
  { id: 'digerente', name: 'Digerente' },
  { id: 'respiratorio', name: 'Respiratorio' },
  { id: 'urinario', name: 'Urinario' },
  { id: 'riproduttivo', name: 'Riproduttivo' },
];

/** Selettore dell'apparato visibile (nello stato è lo strato del modello). */
export function LayerSwitch() {
  const { state, dispatch } = useAtlas();
  return (
    <SelectorGroup
      title="Apparati"
      variant="list"
      options={LAYERS}
      value={state.layer}
      onChange={(layer) => dispatch({ type: 'setLayer', layer })}
    />
  );
}
