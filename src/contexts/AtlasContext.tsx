import { createContext, type ReactNode, useEffect, useMemo, useReducer, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { AtlasDispatch, AtlasState } from '@/models/atlas';
import { atlasReducer, initialAtlasState } from '@/utils/atlasReducer';
import { readUrl, searchFor, urlChange, urlFor } from '@/utils/url';

export const AtlasContext = createContext<{ state: AtlasState; dispatch: AtlasDispatch } | null>(null);

/** Stato dell'atlante, sincronizzato con l'indirizzo del router e con la cronologia del browser. */
export function AtlasProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(atlasReducer, location.pathname, initialAtlasState);

  // Indietro, Avanti e i collegamenti del router cambiano l'indirizzo: lo stato si allinea nello
  // stesso disegno, così rotte e stato non sono mai fuori passo. Se l'indirizzo è quello che
  // lo stato ha appena scritto, non c'è niente da leggere.
  const [seen, setSeen] = useState(location);
  if (seen !== location) {
    setSeen(location);
    if (location.pathname !== urlFor(state)) dispatch({ type: 'fromUrl', ...readUrl(location.pathname) });
  }

  const { selection, sheet, page, guidedPath, home } = state;
  const { pathname, search } = location;
  useEffect(() => {
    const change = urlChange({ selection, sheet, page, guidedPath, home }, pathname);
    if (change) navigate({ pathname: change.pathname, search: searchFor(search) }, { replace: change.replace });
  }, [selection, sheet, page, guidedPath, home, pathname, search, navigate]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AtlasContext.Provider value={value}>{children}</AtlasContext.Provider>;
}
