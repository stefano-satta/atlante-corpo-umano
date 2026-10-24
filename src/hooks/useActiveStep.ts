import { useAtlas } from './useAtlas';
import { useGuidedPath } from './useContent';

/** Percorso in corso e passo mostrato, se il contenuto è pubblicato e già caricato. */
export function useActiveStep() {
  const { state } = useAtlas();
  const { data: path, error } = useGuidedPath(state.guidedPath?.id);
  const step = path && state.guidedPath ? path.passi[state.guidedPath.step] : undefined;
  return { path, step, number: state.guidedPath?.step ?? 0, error };
}
