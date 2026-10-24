import { contentForUnit, hasGuidedPath } from '@/utils/content';
import { sceneApi } from '@/utils/sceneApi';
import { useAtlas } from './useAtlas';

/** Unità selezionata e, se la scheda è aperta e disponibile, la voce di contenuto da mostrare. */
export function useSelectedStructure() {
  const { state } = useAtlas();
  const unit = state.selection ? sceneApi.units.get(state.selection) : undefined;
  const entry = contentForUnit(unit);
  const sheet = state.sheet && entry?.scheda ? entry : undefined;
  return { unit, entry, sheet };
}

/** Percorso guidato in corso e pubblicato: un indirizzo verso un percorso che non c'è non apre nulla. */
export function useOpenGuidedPath() {
  const { state } = useAtlas();
  return !!state.guidedPath && hasGuidedPath(state.guidedPath.id);
}
