import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { AtlasAction, AtlasDispatch, AtlasState } from '@/models/atlas';
import { arrive, DEFAULT_VIEW, historyOf, sameHistory, sameView, viewFromLocation } from '@/utils/atlasHistory';
import { atlasReducer, initialAtlasState } from '@/utils/atlasReducer';
import { searchFor, urlChange, urlFor } from '@/utils/url';

export const AtlasContext = createContext<{ state: AtlasState; dispatch: AtlasDispatch } | null>(null);

/**
 * Stato dell'atlante. La parte navigabile (strato, struttura, scheda, pagina, percorso, soglia, tema del quiz)
 * si legge dall'indirizzo e dalla voce di cronologia (`utils/atlasHistory.ts`); il resto è stato effimero.
 * `dispatch` applica le regole di `atlasReducer` e, se la vista cambia, porta il router al nuovo indirizzo:
 * le azioni di uno stesso gestore diventano una sola navigazione, come una sola voce di cronologia.
 */
export function AtlasProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Vista dell'indirizzo, ricalcolata a ogni cambio di indirizzo; quello che l'indirizzo non dice si
  // prende dalla vista di prima (`viewFromLocation`).
  const [arrival, setArrival] = useState(() => {
    const view = viewFromLocation(location.pathname, location.state, DEFAULT_VIEW);
    return { location, view, state: arrive(initialAtlasState(location.pathname), view) };
  });
  // Stato effimero (corpo, pelle, battito, guida, domanda del quiz) e, finché il router non è arrivato
  // al nuovo indirizzo, lo stato completo già deciso da `dispatch`.
  const [own, setOwn] = useState<AtlasState | null>(null);

  let { view, state: base } = arrival;
  if (arrival.location !== location) {
    view = viewFromLocation(location.pathname, location.state, arrival.view);
    base = arrive(own ?? arrival.state, view);
    setArrival({ location, view, state: base });
    setOwn(null);
  } else if (own) base = own;
  const state = base;

  // Lo stato più recente, anche tra due `dispatch` dello stesso gestore.
  const latest = useRef(state);
  latest.current = state;

  const dispatch = useCallback((a: AtlasAction) => {
    const prev = latest.current;
    const next = atlasReducer(prev, a);
    if (next === prev) return;
    latest.current = next;
    setOwn(next);
  }, []);

  // Una vista decisa da `dispatch` porta il router al suo indirizzo, una volta per gestore e prima del
  // disegno. È una scrittura sola: arrivato all'indirizzo, la vista si rilegge da lì.
  useLayoutEffect(() => {
    if (!own || sameView(own, view)) return;
    const history = historyOf(own);
    const change = urlChange(own, location.pathname);
    if (change)
      navigate(
        { pathname: change.pathname, search: searchFor(location.search) },
        { replace: change.replace, state: history },
      );
    // Stesso indirizzo, ma cambia quello che l'indirizzo non dice (lo strato di un percorso o del quiz).
    else if (!sameHistory(location.state, history)) navigate(location, { replace: true, state: history });
  }, [own, view, location, navigate]);

  // Un indirizzo non nella forma attuale (di prima, sconosciuto, un percorso senza passo) si riscrive
  // senza voce di cronologia. Va solo dall'indirizzo all'indirizzo: lo stato non c'entra.
  const canonical = urlFor(view);
  useEffect(() => {
    if (canonical !== location.pathname)
      navigate({ pathname: canonical, search: searchFor(location.search) }, { replace: true, state: historyOf(view) });
  }, [canonical, location.pathname, location.search, view, navigate]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return <AtlasContext.Provider value={value}>{children}</AtlasContext.Provider>;
}
