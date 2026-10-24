import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

export type Strato = 'muscoli' | 'organi' | 'scheletro';
export type IdPagina = 'fonti' | 'informazioni';

export interface StatoAtlante {
  strato: Strato;
  pelle: boolean;
  /** Unità selezionata: id di un organo o di un elemento (osso, muscolo). */
  selezione: string | null;
  scheda: boolean;
  /** Pagina di lettura aperta sopra l'atlante (Fonti, Informazioni). */
  pagina: IdPagina | null;
  hover: string | null;
}

export type Azione =
  | { tipo: 'strato'; strato: Strato }
  /** Mostra lo strato che contiene la struttura selezionata, senza perdere la selezione (indirizzo diretto). */
  | { tipo: 'mostra-strato'; strato: Strato }
  | { tipo: 'pelle' }
  | { tipo: 'seleziona'; id: string | null }
  | { tipo: 'scheda'; aperta: boolean }
  | { tipo: 'pagina'; pagina: IdPagina | null }
  | { tipo: 'hover'; id: string | null }
  | { tipo: 'da-url'; selezione: string | null; scheda: boolean; pagina: IdPagina | null };

export function riduttore(s: StatoAtlante, a: Azione): StatoAtlante {
  switch (a.tipo) {
    case 'strato':
      return { ...s, strato: a.strato, selezione: null, scheda: false };
    case 'mostra-strato':
      return { ...s, strato: a.strato };
    case 'pelle':
      return { ...s, pelle: !s.pelle };
    case 'seleziona':
      return { ...s, selezione: a.id, scheda: false };
    case 'scheda':
      return { ...s, scheda: a.aperta && s.selezione !== null };
    case 'pagina':
      return { ...s, pagina: a.pagina };
    case 'hover':
      return s.hover === a.id ? s : { ...s, hover: a.id };
    case 'da-url':
      // Aprendo una pagina dall'indirizzo la selezione resta quella che c'era.
      return a.pagina ? { ...s, pagina: a.pagina } : { ...s, selezione: a.selezione, scheda: a.scheda, pagina: null };
  }
}

// Indirizzi (D11): /esplora/<id>, /organo/<id>, /fonti, /informazioni.
const PAGINE: IdPagina[] = ['fonti', 'informazioni'];

function leggiUrl(): { selezione: string | null; scheda: boolean; pagina: IdPagina | null } {
  const pagina = PAGINE.find((p) => location.pathname === `/${p}`) ?? null;
  const m = /^\/(esplora|organo)\/([^/]+)/.exec(location.pathname);
  if (!m) return { selezione: null, scheda: false, pagina };
  return { selezione: decodeURIComponent(m[2]), scheda: m[1] === 'organo', pagina };
}

function scriviUrl(selezione: string | null, scheda: boolean, pagina: IdPagina | null) {
  const percorso = pagina
    ? `/${pagina}`
    : selezione
      ? `/${scheda ? 'organo' : 'esplora'}/${encodeURIComponent(selezione)}`
      : '/';
  if (percorso !== location.pathname) history.pushState(null, '', percorso + location.search);
}

const Contesto = createContext<{ stato: StatoAtlante; invia: (a: Azione) => void } | null>(null);

export function ProviderAtlante({ children }: { children: ReactNode }) {
  const [stato, invia] = useReducer(riduttore, undefined, () => ({
    strato: 'organi' as Strato,
    pelle: true,
    hover: null,
    ...leggiUrl(),
  }));

  useEffect(
    () => scriviUrl(stato.selezione, stato.scheda, stato.pagina),
    [stato.selezione, stato.scheda, stato.pagina],
  );
  useEffect(() => {
    const suPopstate = () => invia({ tipo: 'da-url', ...leggiUrl() });
    addEventListener('popstate', suPopstate);
    return () => removeEventListener('popstate', suPopstate);
  }, []);

  const valore = useMemo(() => ({ stato, invia }), [stato]);
  return <Contesto.Provider value={valore}>{children}</Contesto.Provider>;
}

export function useAtlante() {
  const c = useContext(Contesto);
  if (!c) throw new Error('useAtlante fuori da ProviderAtlante');
  return c;
}

export function useMovimentoRidotto() {
  const query = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)'), []);
  const [ridotto, aggiorna] = useReducer(() => query.matches, query.matches);
  useEffect(() => {
    query.addEventListener('change', aggiorna);
    return () => query.removeEventListener('change', aggiorna);
  }, [query]);
  return ridotto;
}

/** Strati del modello visibili per ciascun preset. */
export const STRATI_VISIBILI: Record<Strato, Array<'ossa' | 'muscoli' | 'organi'>> = {
  muscoli: ['muscoli'],
  organi: ['ossa', 'organi'],
  scheletro: ['ossa'],
};

export const useInvia = () => useAtlante().invia;
export const useSelezione = () => {
  const { stato, invia } = useAtlante();
  const seleziona = useCallback((id: string | null) => invia({ tipo: 'seleziona', id }), [invia]);
  return [stato.selezione, seleziona] as const;
};
