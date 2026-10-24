import { createContext, type ReactNode, useEffect, useMemo, useReducer } from 'react';
import type { AtlasDispatch, AtlasState } from '@/models/atlas';
import { atlasReducer, initialAtlasState } from '@/utils/atlasReducer';
import { readUrl, writeUrl } from '@/utils/url';

export const AtlasContext = createContext<{ state: AtlasState; dispatch: AtlasDispatch } | null>(null);

/** Stato dell'atlante, sincronizzato con l'indirizzo e con la cronologia del browser. */
export function AtlasProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(atlasReducer, undefined, initialAtlasState);

  const { selection, sheet, page, guidedPath } = state;
  useEffect(() => writeUrl({ selection, sheet, page, guidedPath }), [selection, sheet, page, guidedPath]);
  useEffect(() => {
    const onPopState = () => dispatch({ type: 'fromUrl', ...readUrl() });
    addEventListener('popstate', onPopState);
    return () => removeEventListener('popstate', onPopState);
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AtlasContext.Provider value={value}>{children}</AtlasContext.Provider>;
}
