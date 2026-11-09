import { GUIDED_PATHS } from '@/utils/content';
import { titleFor } from '@/utils/pages';
import { useAtlas } from './useAtlas';

/** Titolo della scheda del browser per lo stato dell'atlante; il nome della struttura lo dà chi la mostra. */
export function useDocumentTitle(structure: string | null | undefined) {
  const { state } = useAtlas();
  const guidedPath = state.guidedPath && GUIDED_PATHS.find((p) => p.id === state.guidedPath?.id)?.titolo;
  return titleFor(state, { structure, guidedPath });
}
